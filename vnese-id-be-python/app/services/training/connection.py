import json
import sys
from typing import List
from fastapi import WebSocket

# Lưu trữ các kết nối WebSocket đang hoạt động
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.training_process = None
        self.log_buffer = []
        self.training_stopped = True

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

async def handle_websocket_message(websocket: WebSocket, message_data: dict):
    """Xử lý tin nhắn từ WebSocket client."""
    try:
        print(f"Received command: {message_data}", file=sys.stderr)
        
        from .process import run_training_with_params
        from .models import TrainingParams
        
        if message_data.get("action") == "start_training":
            # Kiểm tra nếu đang có quá trình huấn luyện
            if manager.training_process is not None:
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