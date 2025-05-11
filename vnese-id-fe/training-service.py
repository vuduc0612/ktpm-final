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

# Mô hình dữ liệu cho các tham số huấn luyện
class TrainingParams(BaseModel):
    data_path: str = Field(
        default=str(BASE_DIR / "dataset/corners"),
        description="Đường dẫn đến thư mục chứa dữ liệu"
    )
    num_classes: int = Field(default=4, description="Số lượng lớp")
    class_names: List[str] = Field(
        default=['top_left', 'top_right', 'bottom_left', 'bottom_right'],
        description="Tên các lớp"
    )
    img_size: int = Field(default=640, description="Kích thước ảnh huấn luyện")
    batch_size: int = Field(default=16, description="Batch size")
    epochs: int = Field(default=3, description="Số epoch")
    pretrained_weights: str = Field(
        default=str(YOLOV5_DIR / "runs/train/exp/weights/corner.pt"),
        description="File weight đã có"
    )
    project_dir: str = Field(
        default=str(BASE_DIR),
        description="Thư mục cha lưu kết quả"
    )
    run_name: str = Field(
        default="corner_detection",
        description="Tên thư mục con để lưu kết quả"
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
    metrics_pattern = r"(\w+)\s+([\d\.]+)"
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

                 # Bỏ qua các dòng progress bar
                # progress_match = re.search(r'(\d+)%\|.*\|\s*(\d+)/(\d+)\s*\[(.*?)<.*?,\s*([\d\.]+)it/s\]', clean_line)
                # if progress_match:
                #     percent = int(progress_match.group(1))
                #     current = int(progress_match.group(2))
                #     total = int(progress_match.group(3))
                #     elapsed = progress_match.group(4)
                #     speed = float(progress_match.group(5))
                #     await manager.broadcast({
                #         "type": "progress",
                #         "percent": percent,
                #         "current": current,
                #         "total": total,
                #         "elapsed": elapsed,
                #         "speed": speed
                #     })
                #     continue  # Không gửi log text dòng này nữa
                # if re.search(r'\d+%\|', clean_line) and 'it/s' in clean_line:
                #     continue
                # if re.search(r'\d+%\|', clean_line) and 'it/s' in clean_line:
                #     continue
                
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
                    metrics = {metric: float(value) for metric, value in matches}
                    await manager.broadcast({
                        "type": "metrics",
                        "metrics": metrics
                    })
                if "Class" in clean_line and "mAP50" in clean_line:
                    match = re.search(validation_pattern, clean_line)
                    if match:
                        class_name, precision, recall, map50, map50_95 = match.groups()
                        await manager.broadcast({
                            "type": "validation",
                            "class": class_name,
                            "precision": float(precision),
                            "recall": float(recall),
                            "mAP50": float(map50),
                            "mAP50-95": float(map50_95)
                        })
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

async def create_dataset_config(data_path, num_classes, class_names):
    """Tạo file cấu hình dataset."""
    try:
        data_path = Path(data_path)
        print(f"Creating dataset config at {data_path}", file=sys.stderr)
        
        # Kiểm tra thư mục dữ liệu tồn tại
        if not data_path.exists():
            print(f"WARNING: Data path {data_path} does not exist!", file=sys.stderr)
            os.makedirs(data_path, exist_ok=True)
            print(f"Created data path directory: {data_path}", file=sys.stderr)
            
        # Kiểm tra thư mục train/images
        train_dir = data_path / 'train/images'
        if not train_dir.exists():
            print(f"WARNING: Train directory {train_dir} does not exist!", file=sys.stderr)
            os.makedirs(train_dir, exist_ok=True)
            print(f"Created train directory: {train_dir}", file=sys.stderr)
            
        # Kiểm tra thư mục valid/images
        valid_dir = data_path / 'valid/images'
        if not valid_dir.exists():
            print(f"WARNING: Valid directory {valid_dir} does not exist!", file=sys.stderr)
            os.makedirs(valid_dir, exist_ok=True)
            print(f"Created valid directory: {valid_dir}", file=sys.stderr)
        
        # Tạo cấu hình
        data_yaml = {
            'train': str(data_path / 'train/images'),
            'val': str(data_path / 'valid/images'),
            'test': str(data_path / 'test/images') if (data_path / 'test/images').exists() else '',
            'nc': num_classes,
            'names': class_names
        }
        
        # Lưu file cấu hình
        config_path = data_path / 'dataset.yaml'
        with open(config_path, 'w') as f:
            yaml.dump(data_yaml, f, default_flow_style=False)
        
        print(f"Dataset config created at {config_path}", file=sys.stderr)
        return str(config_path)
    except Exception as e:
        print(f"ERROR creating dataset config: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise

async def run_training_with_params(params: TrainingParams):
    """Thực hiện huấn luyện với các tham số đã cho và gửi đầu ra thông qua WebSocket."""
    try:
        print(f"Starting training with params: {params.dict()}", file=sys.stderr)
        
        # Đặt lại trạng thái stopped
        manager.training_stopped = False
        manager.training_process = None
        # Tạo file cấu hình dataset
        data_config = await create_dataset_config(
            params.data_path, 
            params.num_classes, 
            params.class_names
        )
        
        # Tạo thư mục lưu kết quả nếu chưa tồn tại
        project_dir = Path(params.project_dir)
        os.makedirs(project_dir, exist_ok=True)
        print(f"Project directory: {project_dir}", file=sys.stderr)
        
        # Kiểm tra file weights tồn tại
        weights_path = Path(params.pretrained_weights)
        if not weights_path.exists():
            print(f"WARNING: Weights file {weights_path} does not exist!", file=sys.stderr)
            # Sử dụng weights mặc định của YOLOv5 nếu không tìm thấy
            params.pretrained_weights = "yolov5s.pt"
            print(f"Using default weights: {params.pretrained_weights}", file=sys.stderr)
        
        # Tạo lệnh huấn luyện
        cmd = [
            sys.executable,  # Sử dụng Python interpreter hiện tại
            str(YOLOV5_DIR / "train.py"), 
            "--img", str(params.img_size),
            "--batch", str(params.batch_size),
            "--epochs", str(params.epochs),
            "--data", data_config,
            "--weights", params.pretrained_weights,
            "--project", str(project_dir),
            "--name", params.run_name,
            "--exist-ok"
        ]
        
        # Thông báo lệnh huấn luyện
        cmd_str = " ".join(cmd)
        print(f"Training command: {cmd_str}", file=sys.stderr)
        # await manager.broadcast({
        #     "type": "raw_log", 
        #     "content": f"Thực hiện lệnh huấn luyện: {cmd_str}"
        # })
        
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