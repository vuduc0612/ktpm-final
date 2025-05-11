import os
import subprocess
import asyncio
import threading
import re
import json
import yaml
import sys
import traceback
from pathlib import Path
from typing import List, Dict, Optional
import queue
from fastapi import WebSocket
from pydantic import BaseModel, Field

# Đường dẫn tuyệt đối đến thư mục chứa dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
print(f"Base directory: {BASE_DIR}", file=sys.stderr)

# Cập nhật đường dẫn cho YOLOv5
YOLOV5_DIR = BASE_DIR / "yolov5"
print(f"YOLOv5 directory: {YOLOV5_DIR}", file=sys.stderr)

# Kiểm tra thư mục YOLOv5 tồn tại hay không
if not YOLOV5_DIR.exists():
    print(f"WARNING: YOLOv5 directory not found at {YOLOV5_DIR}", file=sys.stderr)

# Import dataset_service
from app.services.dataset_service import dataset_service

# Mô hình dữ liệu cho các tham số huấn luyện
class TrainingParams(BaseModel):
    dataPath: str = Field(
        default=str(BASE_DIR / "dataset/corners"),
        description="Đường dẫn đến thư mục chứa dữ liệu"
    )
    batchSize: int = Field(default=16, description="Batch size")
    epochs: int = Field(default=3, description="Số epoch")
    learningRate: float = Field(default=0.01, description="Learning rate cho huấn luyện")
    pretrainedWeights: str = Field(
        default="",
        description="Tên file weight đã có trong thư mục weights. Để trống sẽ sử dụng mặc định."
    )
    projectDir: str = Field(
        default=str(BASE_DIR),
        description="Thư mục cha lưu kết quả"
    )
    runName: str = Field(
        default="corner_detection",
        description="Tên thư mục con để lưu kết quả"
    )
    createDataset: bool = Field(
        default=False,
        description="Tạo mới dataset từ thư mục nguồn D:/vnese-id-management/dataset trước khi huấn luyện"
    )

# Lưu trữ các kết nối WebSocket đang hoạt động
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.training_process = None
        self.log_buffer = []
        self.training_stopped = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket connected. Total connections: {len(self.active_connections)}", file=sys.stderr)
        # Gửi log đã lưu trữ cho kết nối mới
        for log in self.log_buffer:
            await websocket.send_text(json.dumps(log))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}", file=sys.stderr)

    async def broadcast(self, message: dict):
        # Lưu tin nhắn vào bộ đệm
        self.log_buffer.append(message)
        # Giới hạn kích thước bộ đệm
        if len(self.log_buffer) > 1000:
            self.log_buffer = self.log_buffer[-1000:]
        
        # Gửi tin nhắn đến tất cả kết nối
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending message to WebSocket: {e}", file=sys.stderr)

# Khởi tạo connection manager
manager = ConnectionManager()
manager.training_process = None
manager.training_stopped = True
# Hàm để xóa mã ANSI color
def strip_ansi_codes(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

# Hàm để chạy trong thread riêng và xử lý đầu ra của subprocess
def process_output(process, queue_obj):
    for line in iter(process.stdout.readline, b''):
        if line:
            queue_obj.put(line)
    process.stdout.close()

def process_error(process, queue_obj):
    for line in iter(process.stderr.readline, b''):
        if line:
            queue_obj.put(line)
    process.stderr.close()

async def parse_training_output(output_queue):
    """Phân tích và định dạng đầu ra từ quá trình huấn luyện, gửi log theo block."""
    block_lines = []
    epoch_pattern = r"Epoch\s+(\d+)/(\d+)"
    metrics_pattern = r"(\w+)\s+([\d\.]+)(?!\S)"
    validation_pattern = r"Class\s+(\w+)\s+.*P\s+([\d\.]+)\s+R\s+([\d\.]+)\s+mAP50\s+([\d\.]+)\s+mAP50-95\s+([\d\.]+)"
    progress_pattern = r"(\d+)/(\d+)"
    completed_pattern = r"(\d+) epochs completed"
    while True:
        try:
            if manager.training_stopped:
                break
            try:
                line = output_queue.get(block=False)
                line = line.decode('utf-8').rstrip('\n')
                clean_line = strip_ansi_codes(line)
                
                # Gom block: nếu gặp dòng trống hoặc dòng phân cách, gửi block
                if clean_line.strip() == '' and block_lines:
                    await manager.broadcast({"type": "raw_log", "content": '\n'.join(block_lines)})
                    block_lines = []
                else:
                    block_lines.append(clean_line)

                # --- Phân tích các thông tin khác như cũ (epoch, metrics, v.v.) ---
                if "Epoch" in clean_line:
                    match = re.search(epoch_pattern, clean_line)
                    if match:
                        current_epoch, total_epochs = match.groups()
                        await manager.broadcast({
                            "type": "epoch_progress",
                            "current_epoch": int(current_epoch),
                            "total_epochs": int(total_epochs)
                        })
                elif re.search(progress_pattern, clean_line):
                    match = re.search(progress_pattern, clean_line)
                    if match:
                        current, total = match.groups()
                        try:
                            current_epoch = int(current)
                            total_epochs = int(total)
                            await manager.broadcast({
                                "type": "epoch_progress",
                                "current_epoch": current_epoch,
                                "total_epochs": total_epochs
                            })
                        except ValueError:
                            pass
                elif re.search(completed_pattern, clean_line):
                    match = re.search(completed_pattern, clean_line)
                    if match:
                        epochs = match.group(1)
                        print(f"Training completed with {epochs} epochs", file=sys.stderr)
                        await manager.broadcast({
                            "type": "status", 
                            "status": "completed",
                            "message": f"Hoàn thành {epochs} epochs"
                        })
                matches = re.findall(metrics_pattern, clean_line)
                if matches:
                    try:
                        metrics = {}
                        for metric, value in matches:
                            if value != '...' and re.match(r'^[\d\.]+$', value):
                                metrics[metric] = float(value)
                        if metrics:  # Chỉ gửi nếu có ít nhất một metric hợp lệ
                            await manager.broadcast({
                                "type": "metrics",
                                "metrics": metrics
                            })
                    except ValueError as e:
                        print(f"Lỗi chuyển đổi metric: {e}", file=sys.stderr)
                if "Class" in clean_line and "mAP50" in clean_line:
                    match = re.search(validation_pattern, clean_line)
                    if match:
                        try:
                            class_name, precision, recall, map50, map50_95 = match.groups()
                            # Kiểm tra tất cả giá trị có thể chuyển sang float không
                            if all(re.match(r'^[\d\.]+$', val) for val in [precision, recall, map50, map50_95]):
                                await manager.broadcast({
                                    "type": "validation",
                                    "class": class_name,
                                    "precision": float(precision),
                                    "recall": float(recall),
                                    "mAP50": float(map50),
                                    "mAP50-95": float(map50_95)
                                })
                        except ValueError as e:
                            print(f"Lỗi chuyển đổi dữ liệu validation: {e}", file=sys.stderr)
            except queue.Empty:
                await asyncio.sleep(0.1)
                continue
        except Exception as e:
            print(f"Error in parse_training_output: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            await asyncio.sleep(0.1)
    # Gửi block cuối cùng nếu còn
    if block_lines:
        await manager.broadcast({"type": "raw_log", "content": '\n'.join(block_lines)})

async def run_training_with_params(params: TrainingParams):
    """Thực hiện huấn luyện với các tham số đã cho và gửi đầu ra thông qua WebSocket."""
    try:
        print(f"Starting training with params: {params.dict()}", file=sys.stderr)
        
        # Đặt lại trạng thái stopped
        manager.training_stopped = False
        manager.training_process = None
        
        # Luôn tạo dataset mới từ thư mục nguồn trước khi train
        print("Creating new dataset from source directory", file=sys.stderr)
        await manager.broadcast({
            "type": "raw_log", 
            "content": "Đang tạo dataset mới từ thư mục nguồn D:/vnese-id-management/dataset..."
        })
        
        try:
            # Gọi dataset_service để tạo dataset mới
            result = dataset_service.create_dataset_config()
            print(f"Dataset creation result: {result}", file=sys.stderr)
            await manager.broadcast({
                "type": "raw_log", 
                "content": f"Đã tạo dataset thành công! Train: {result['train_size']}, Valid: {result['valid_size']}, Test: {result['test_size']}"
            })
            
            # Đảm bảo sử dụng đường dẫn từ dataset_service
            params.dataPath = str(dataset_service.target_dir)
            print(f"Using dataset path: {params.dataPath}", file=sys.stderr)
        except Exception as e:
            error_msg = f"Lỗi khi tạo dataset: {str(e)}"
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
        await manager.broadcast({
            "type": "raw_log", 
            "content": f"Sử dụng weights: {weights_path}"
        })
        
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
            print(f"Setting learning rate to {params.learningRate}", file=sys.stderr)
            await manager.broadcast({
                "type": "raw_log", 
                "content": f"Đang cấu hình learning rate: {params.learningRate}"
            })
            
            # Tạo file hyperparameter tùy chỉnh với learning rate đã đặt
            custom_hyp_path = await create_custom_hyperparameters(params.learningRate)
            if custom_hyp_path:
                # Thêm tham số hyp vào lệnh huấn luyện
                cmd.extend(["--hyp", custom_hyp_path])
                print(f"Using custom hyperparameters: {custom_hyp_path}", file=sys.stderr)
                await manager.broadcast({
                    "type": "raw_log", 
                    "content": f"Sử dụng file hyperparameter tùy chỉnh với lr={params.learningRate}"
                })
        
        # Thông báo lệnh huấn luyện
        cmd_str = " ".join(cmd)
        print(f"Training command: {cmd_str}", file=sys.stderr)
        # Sử dụng subprocess thay vì asyncio.create_subprocess_exec
        try:
            # Tạo queue cho đầu ra
            output_queue = queue.Queue()
            
            # Khởi động tiến trình với subprocess.Popen
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=1,
                universal_newlines=False,
                shell=False
            )
            
            print(f"Training process started with PID: {process.pid}", file=sys.stderr)
            manager.training_process = process
            
            # Tạo các thread để xử lý đầu ra
            stdout_thread = threading.Thread(
                target=process_output, 
                args=(process, output_queue)
            )
            stderr_thread = threading.Thread(
                target=process_error, 
                args=(process, output_queue)
            )
            
            # Bắt đầu thread xử lý đầu ra
            stdout_thread.daemon = True
            stderr_thread.daemon = True
            stdout_thread.start()
            stderr_thread.start()
            
            # Khởi động task phân tích đầu ra
            parser_task = asyncio.create_task(parse_training_output(output_queue))
            
            # Kiểm tra tiến trình cho đến khi kết thúc
            while True:
                if manager.training_stopped:
                    print("Training process was requested to stop", file=sys.stderr)
                    process.terminate()
                    break
                    
                return_code = process.poll()
                if return_code is not None:
                    print(f"Training process completed with return code: {return_code}", file=sys.stderr)
                    break
                    
                await asyncio.sleep(0.5)
            
            # Thông báo hoàn thành
            if not manager.training_stopped:
                if return_code == 0:
                    await manager.broadcast({"type": "status", "status": "completed"})
                    manager.log_buffer.clear()  # Xóa log ngay sau khi hoàn thành
                else:
                    await manager.broadcast({
                        "type": "error", 
                        "message": f"Quá trình huấn luyện kết thúc với mã lỗi: {return_code}"
                    })
                    manager.log_buffer.clear()  # Xóa log nếu có lỗi
            # Đánh dấu là đã kết thúc
            manager.training_stopped = True
            
            # Đợi parser task kết thúc
            await parser_task
                
        except Exception as e:
            print(f"ERROR starting training process: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            await manager.broadcast({
                "type": "error", 
                "message": f"Lỗi khi chạy quá trình huấn luyện: {str(e)}"
            })
    except Exception as e:
        print(f"ERROR in run_training_with_params: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        await manager.broadcast({
            "type": "error", 
            "message": f"Lỗi trong quá trình huấn luyện: {str(e)}"
        })
    finally:
        manager.training_process = None
        manager.training_stopped = True
        print("Training resources released", file=sys.stderr)
        # Xóa log_buffer khi train kết thúc
        manager.log_buffer.clear()

# Các hàm service
async def start_training_service(params: Optional[TrainingParams] = None):
    """Service để bắt đầu huấn luyện."""
    if manager.training_process is not None:
        print("Cannot start training: Already running", file=sys.stderr)
        return {
            "status": "error",
            "message": "Quá trình huấn luyện đang chạy. Vui lòng dừng trước khi bắt đầu mới."
        }
    
    # Sử dụng tham số mặc định nếu không có tham số nào được cung cấp
    training_params = params if params else TrainingParams()
    
    # Bắt đầu quá trình huấn luyện trong task riêng
    print(f"Starting training with params: {training_params.dict()}", file=sys.stderr)
    asyncio.create_task(run_training_with_params(training_params))
    
    return {
        "status": "started",
        "message": "Quá trình huấn luyện đã bắt đầu",
        "params": training_params.dict()
    }

async def stop_training_service():
    """Service để dừng quá trình huấn luyện đang chạy."""
    if manager.training_process is None:
        return {
            "status": "error",
            "message": "Không có quá trình huấn luyện đang chạy"
        }
    
    manager.training_stopped = True
    await manager.broadcast({"type": "status", "status": "stopped"})
    
    return {
        "status": "stopped", 
        "message": "Quá trình huấn luyện đã dừng"
    }

def get_training_status_service():
    """Service để kiểm tra trạng thái huấn luyện hiện tại."""
    return {
        "is_training": manager.training_process is not None,
        "log_buffer_size": len(manager.log_buffer),
        "active_connections": len(manager.active_connections)
    }

def get_training_logs_service():
    """Service để lấy tất cả log huấn luyện hiện tại."""
    return {"logs": manager.log_buffer}

async def handle_websocket_message(websocket: WebSocket, message_data: dict):
    """Xử lý tin nhắn từ WebSocket client."""
    try:
        print(f"Received command: {message_data}", file=sys.stderr)
        
        if message_data.get("action") == "start_training":
            # Kiểm tra nếu đang có quá trình huấn luyện
            if manager.training_process is not None:
                # await websocket.send_text(json.dumps({
                #     "type": "error", 
                #     "message": "Quá trình huấn luyện đang chạy"
                # }))
                # return
                # Kiểm tra xem quá trình còn sống không
                if manager.training_process.poll() is None:
                    # Quá trình thực sự đang chạy
                    print("Training process is already running. Ignoring start command.", file=sys.stderr)
                    return
                else:
                    # Quá trình đã kết thúc nhưng chưa được reset
                    print("Training process reference exists but process is not running. Resetting...", file=sys.stderr)
                    manager.training_process = None
                
            # Lấy tham số từ client (nếu có)
            params = message_data.get("params", {})
            training_params = TrainingParams(**params) if params else TrainingParams()
            
            # Thông báo đã bắt đầu
            await websocket.send_text(json.dumps({
                "type": "status", 
                "status": "started"
            }))
            
            # Thực hiện huấn luyện
            await run_training_with_params(training_params)
            
        elif message_data.get("action") == "stop_training":
            # Kiểm tra nếu có quá trình đang chạy
            if manager.training_process is None:
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Không có quá trình huấn luyện đang chạy"
                }))
                return
                
            # Dừng quá trình huấn luyện
            manager.training_stopped = True
            await websocket.send_text(json.dumps({
                "type": "status", 
                "status": "stopped"
            }))
            
    except Exception as e:
        print(f"Error handling WebSocket message: {e}", file=sys.stderr)
        await websocket.send_text(json.dumps({
            "type": "error", 
            "message": f"Lỗi xử lý tin nhắn: {str(e)}"
        })) 

# Thêm hàm tạo file hyperparameter
async def create_custom_hyperparameters(lr: float, base_hyp_path=None) -> str:
    """Tạo file hyperparameter với learning rate tùy chỉnh."""
    if base_hyp_path is None:
        # Sử dụng file hyp mặc định của YOLOv5
        base_hyp_path = YOLOV5_DIR / "data" / "hyps" / "hyp.scratch-low.yaml"
    
    if not os.path.exists(base_hyp_path):
        print(f"Warning: Base hyperparameter file not found at {base_hyp_path}", file=sys.stderr)
        # Tìm bất kỳ file hyp nào có sẵn
        hyp_files = list(Path(YOLOV5_DIR / "data" / "hyps").glob("*.yaml"))
        if hyp_files:
            base_hyp_path = hyp_files[0]
            print(f"Using alternative hyperparameter file: {base_hyp_path}", file=sys.stderr)
        else:
            # Tạo file hyp cơ bản nếu không tìm thấy
            print(f"No hyperparameter files found, creating basic one", file=sys.stderr)
            base_hyp = {
                "lr0": 0.01,
                "lrf": 0.01,
                "momentum": 0.937,
                "weight_decay": 0.0005,
                "warmup_epochs": 3.0,
                "warmup_momentum": 0.8,
                "warmup_bias_lr": 0.1,
                "box": 0.05,
                "cls": 0.5,
                "cls_pw": 1.0,
                "obj": 1.0,
                "obj_pw": 1.0,
                "iou_t": 0.2,
                "anchor_t": 4.0,
                "fl_gamma": 0.0,
                "hsv_h": 0.015,
                "hsv_s": 0.7,
                "hsv_v": 0.4,
                "degrees": 0.0,
                "translate": 0.1,
                "scale": 0.5,
                "shear": 0.0,
                "perspective": 0.0,
                "flipud": 0.0,
                "fliplr": 0.5,
                "mosaic": 1.0,
                "mixup": 0.0,
                "copy_paste": 0.0
            }
            custom_hyp = base_hyp.copy()
            custom_hyp["lr0"] = lr
            
            # Tạo thư mục nếu không tồn tại
            custom_hyp_dir = BASE_DIR / "custom_hyps"
            os.makedirs(custom_hyp_dir, exist_ok=True)
            
            # Lưu file hyperparameter tùy chỉnh
            custom_hyp_path = custom_hyp_dir / f"hyp_lr_{lr}.yaml"
            with open(custom_hyp_path, "w") as f:
                yaml.dump(custom_hyp, f)
            
            return str(custom_hyp_path)
    
    try:
        # Đọc file hyperparameter cơ bản
        with open(base_hyp_path, "r") as f:
            hyp = yaml.safe_load(f)
        
        # Sửa đổi learning rate
        hyp["lr0"] = lr
        
        # Tạo thư mục nếu không tồn tại
        custom_hyp_dir = BASE_DIR / "custom_hyps"
        os.makedirs(custom_hyp_dir, exist_ok=True)
        
        # Lưu file hyperparameter tùy chỉnh
        custom_hyp_path = custom_hyp_dir / f"hyp_lr_{lr}.yaml"
        with open(custom_hyp_path, "w") as f:
            yaml.dump(hyp, f)
        
        print(f"Created custom hyperparameter file with lr={lr} at {custom_hyp_path}", file=sys.stderr)
        return str(custom_hyp_path)
    except Exception as e:
        print(f"Error creating custom hyperparameter file: {e}", file=sys.stderr)
        return None 

async def get_pretrained_weights_path(weights_name: str) -> str:
    """
    Lấy đường dẫn đến file weights từ thư mục weights hoặc sử dụng mặc định.
    
    Args:
        weights_name: Tên file weight trong thư mục weights
        
    Returns:
        Đường dẫn đầy đủ đến file weights hoặc weights mặc định
    """
    # Thư mục chứa weights do người dùng upload
    weights_dir = BASE_DIR / "weights"
    
    # Nếu không có tên weights hoặc tên rỗng
    if not weights_name or weights_name.strip() == "":
        # Thử tìm file weights mặc định
        default_weights = YOLOV5_DIR / "runs/train/exp/weights/corner.pt"
        if default_weights.exists():
            print(f"Using default weights: {default_weights}", file=sys.stderr)
            return str(default_weights)
        else:
            # Tìm bất kỳ file weights nào trong thư mục weights
            user_weights = list(weights_dir.glob("*.pt"))
            if user_weights:
                print(f"Using found weights: {user_weights[0]}", file=sys.stderr)
                return str(user_weights[0])
            else:
                # Sử dụng weights YOLOv5 mặc định
                print("No custom weights found, using YOLOv5 default", file=sys.stderr)
                return "yolov5s.pt"
    
    # Kiểm tra nếu weights là đường dẫn đầy đủ
    if os.path.isfile(weights_name):
        return weights_name
    
    # Kiểm tra trong thư mục weights
    weights_path = weights_dir / weights_name
    if weights_path.exists():
        print(f"Found user-uploaded weights: {weights_path}", file=sys.stderr)
        return str(weights_path)
    
    # Kiểm tra nếu chỉ cung cấp tên file mà không có phần mở rộng
    if not weights_name.endswith(".pt"):
        weights_path = weights_dir / f"{weights_name}.pt"
        if weights_path.exists():
            print(f"Found user-uploaded weights: {weights_path}", file=sys.stderr)
            return str(weights_path)
    
    # Không tìm thấy, sử dụng YOLOv5 mặc định
    print(f"Weights '{weights_name}' not found, using YOLOv5 default", file=sys.stderr)
    return "yolov5s.pt" 