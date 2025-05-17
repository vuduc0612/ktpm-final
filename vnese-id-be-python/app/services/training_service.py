import sys
import asyncio
from typing import Optional

from app.services.training.models import TrainingParams
from app.services.training.connection import manager
from app.services.training.process import run_training_with_params

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