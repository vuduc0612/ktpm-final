import os
import sys
import queue
import asyncio
import traceback
from pathlib import Path

from .models import TrainingParams
from .connection import manager
from .utils import run_command, BASE_DIR, YOLOV5_DIR
from .hyperparameters import create_custom_hyperparameters
from .weights import get_pretrained_weights_path
from .parser import parse_training_output

# Import dataset_service
from app.services.dataset_service import dataset_service

async def run_training_with_params(params: TrainingParams):
    """Thực hiện huấn luyện với các tham số đã cho và gửi đầu ra thông qua WebSocket."""
    try:
        print(f"Starting training with params: {params.dict()}", file=sys.stderr)
        
        # Đặt lại trạng thái stopped
        manager.training_stopped = False
        manager.training_process = None
        
        # Luôn tạo dataset mới từ thư mục nguồn trước khi train
        # print("Creating new dataset from source directory", file=sys.stderr)
        await manager.broadcast({"type": "status", "status": "started"})
        message = "Đang tạo dataset để huấn luyện..."
        print(f"[STATUS] {message}", file=sys.stdout)
        await manager.broadcast({
            "type": "raw_log", 
            "content": message
        })
        
        try:
            # Gọi dataset_service để tạo dataset mới
            result = dataset_service.create_dataset_config()
            # print(f"Dataset creation result: {result}", file=sys.stderr)
            # message = f"Đã tạo dataset thành công! Train: {result['train_size']}, Valid: {result['valid_size']}, Test: {result['test_size']}"
            # print(f"[STATUS] {message}", file=sys.stdout)
            # await manager.broadcast({
            #     "type": "raw_log", 
            #     "content": message
            # })
            
            # Đảm bảo sử dụng đường dẫn từ dataset_service
            params.dataPath = str(dataset_service.target_dir)
            print(f"Using dataset path: {params.dataPath}", file=sys.stderr)
        except Exception as e:
            error_msg = f"Lỗi khi tạo dataset: {str(e)}"
            print(f"[ERROR] {error_msg}", file=sys.stdout)
            print(f"ERROR: {error_msg}", file=sys.stderr)
            await manager.broadcast({
                "type": "error", 
                "message": error_msg
            })
            raise
        
        # Sử dụng file dataset.yaml đã được tạo bởi dataset_service
        data_config = str(Path(params.dataPath) / 'dataset.yaml')
        print(f"Using dataset config created by dataset_service: {data_config}", file=sys.stderr)
            
        # Tạo thư mục lưu kết quả nếu chưa tồn tại
        project_dir = Path(params.projectDir)
        os.makedirs(project_dir, exist_ok=True)
        print(f"Project directory: {project_dir}", file=sys.stderr)
        
        # Lấy đường dẫn đến file weights đã chuẩn bị
        weights_path = await get_pretrained_weights_path(params.pretrainedWeights)
        print(f"Using weights: {weights_path}", file=sys.stderr)
        # message = f"Sử dụng weights: {weights_path}"
        # print(f"[STATUS] {message}", file=sys.stdout)
        # await manager.broadcast({
        #     "type": "raw_log", 
        #     "content": message
        # })
        
        # Tạo lệnh huấn luyện
        cmd = [
            sys.executable,  # Sử dụng Python interpreter hiện tại
            str(YOLOV5_DIR / "train.py"), 
            "--img", "640",  # Sử dụng giá trị mặc định 640
            "--batch", str(params.batchSize),
            "--epochs", str(params.epochs),
            "--data", data_config,
            "--weights", weights_path,
            "--project", str(project_dir),
            "--name", params.runName,
            "--exist-ok"
        ]
        
        # Nếu learning_rate được cung cấp, áp dụng tham số learning rate bằng cách chỉnh sửa file hyp.yaml
        if params.learningRate is not None:
            # Thêm log để kiểm tra
            # print(f"Setting learning rate to {params.learningRate}", file=sys.stderr)
            # message = f"Đang cấu hình learning rate: {params.learningRate}"
            # print(f"[STATUS] {message}", file=sys.stdout)
            # await manager.broadcast({
            #     "type": "raw_log", 
            #     "content": message
            # })
            
            # Tạo file hyperparameter tùy chỉnh với learning rate đã đặt
            custom_hyp_path = await create_custom_hyperparameters(params.learningRate)
            if custom_hyp_path:
                # Thêm tham số hyp vào lệnh huấn luyện
                cmd.extend(["--hyp", custom_hyp_path])
                print(f"Using custom hyperparameters: {custom_hyp_path}", file=sys.stderr)
                message = f"Sử dụng file hyperparameter tùy chỉnh với lr={params.learningRate}"
                print(f"[STATUS] {message}", file=sys.stdout)
                await manager.broadcast({
                    "type": "raw_log", 
                    "content": message
                })
        
        # Thông báo lệnh huấn luyện
        cmd_str = " ".join(cmd)
        print(f"Training command: {cmd_str}", file=sys.stderr)
        
        # Sử dụng subprocess thay vì asyncio.create_subprocess_exec
        try:
            # Tạo queue cho đầu ra
            output_queue = queue.Queue()
            
            # Khởi động tiến trình với run_command từ utils.py
            process = run_command(cmd, output_queue)
            
            print(f"Training process started with PID: {process.pid}", file=sys.stderr)
            print(f"[STATUS] Bắt đầu quá trình huấn luyện với PID: {process.pid}", file=sys.stdout)
            manager.training_process = process
            
            # Khởi động task phân tích đầu ra
            parser_task = asyncio.create_task(parse_training_output(output_queue))
            
            # Kiểm tra tiến trình cho đến khi kết thúc
            while True:
                if manager.training_stopped:
                    print("Training process was requested to stop", file=sys.stderr)
                    print("[STATUS] Quá trình huấn luyện đã được yêu cầu dừng lại", file=sys.stdout)
                    process.terminate()
                    break
                    
                return_code = process.poll()
                if return_code is not None:
                    print(f"Training process completed with return code: {return_code}", file=sys.stderr)
                    print(f"[STATUS] Quá trình huấn luyện đã hoàn thành với mã trả về: {return_code}", file=sys.stdout)
                    break
                    
                await asyncio.sleep(0.5)
            
            # Thông báo hoàn thành
            if not manager.training_stopped:
                if return_code == 0:
                    print("[STATUS] Quá trình huấn luyện đã hoàn thành thành công", file=sys.stdout)
                    await manager.broadcast({"type": "status", "status": "completed"})
                    manager.log_buffer.clear()  # Xóa log ngay sau khi hoàn thành
                else:
                    error_msg = f"Quá trình huấn luyện kết thúc với mã lỗi: {return_code}"
                    print(f"[ERROR] {error_msg}", file=sys.stdout)
                    await manager.broadcast({
                        "type": "error", 
                        "message": error_msg
                    })
                    manager.log_buffer.clear()  # Xóa log nếu có lỗi
            # Đánh dấu là đã kết thúc
            manager.training_stopped = True
            
            # Đợi parser task kết thúc
            await parser_task
                
        except Exception as e:
            print(f"ERROR starting training process: {e}", file=sys.stderr)
            print(f"[ERROR] Lỗi khi khởi động quá trình huấn luyện: {e}", file=sys.stdout)
            traceback.print_exc(file=sys.stderr)
            await manager.broadcast({
                "type": "error", 
                "message": f"Lỗi khi chạy quá trình huấn luyện: {str(e)}"
            })
    except Exception as e:
        print(f"ERROR in run_training_with_params: {e}", file=sys.stderr)
        print(f"[ERROR] Lỗi trong quá trình huấn luyện: {e}", file=sys.stdout)
        traceback.print_exc(file=sys.stderr)
        await manager.broadcast({
            "type": "error", 
            "message": f"Lỗi trong quá trình huấn luyện: {str(e)}"
        })
    finally:
        manager.training_process = None
        manager.training_stopped = True
        print("Training resources released", file=sys.stderr)
        print("[STATUS] Đã giải phóng tài nguyên huấn luyện", file=sys.stdout)
        # Xóa log_buffer khi train kết thúc
        manager.log_buffer.clear() 