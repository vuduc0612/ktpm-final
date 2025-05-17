from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks, Request, Body, Query, HTTPException, Path as FastAPIPath, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, List, Dict
import os
import sys
import json
from pathlib import Path

# Import từ service layer
from app.services.training_service import (
    start_training_service, stop_training_service, 
    get_training_status_service, get_training_logs_service
)
from app.services.training.connection import manager, handle_websocket_message
from app.services.training.models import TrainingParams
from app.services.dataset_service import dataset_service


# Thêm debug log
print("Initializing training router...", file=sys.stderr)

router = APIRouter()

# Đường dẫn tuyệt đối đến thư mục chứa dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

# Thiết lập template
templates_path = Path(__file__).parent.parent.parent / "static"
templates = Jinja2Templates(directory=str(templates_path))

@router.get("/monitor", response_class=HTMLResponse)
async def get_monitor_page(request: Request):
    """Trả về trang giám sát huấn luyện."""
    return templates.TemplateResponse("training_monitor.html", {"request": request})

#Start training
@router.post("/start")
async def start_training(
    params: Optional[TrainingParams] = Body(None),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """API để bắt đầu huấn luyện với các tham số tùy chỉnh."""
    try:
        # Gọi service để bắt đầu huấn luyện
        print(f"Received params: {params}")
        result = await start_training_service(params)
        
        if result.get("status") == "error":
            return JSONResponse(
                status_code=400,
                content={"status": "failed", "message": result["message"]}
            )
        
        return result
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "failed",
                "message": f"Lỗi khi bắt đầu huấn luyện: {str(e)}",
                "currentEpoch": None,
                "totalEpochs": None
            }
        )

#Stop training
@router.post("/stop")
async def stop_training():
    """API để dừng quá trình huấn luyện đang chạy."""
    try:
        # Gọi service để dừng huấn luyện
        result = await stop_training_service()
        
        if result.get("status") == "error":
            return JSONResponse(
                status_code=400,
                content={"status": "failed", "message": result["message"]}
            )
        
        return result
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "failed",
                "message": f"Lỗi khi dừng huấn luyện: {str(e)}",
                "currentEpoch": None,
                "totalEpochs": None
            }
        )

@router.get("/logs")
async def get_training_logs():
    """API để lấy tất cả log huấn luyện hiện tại."""
    return get_training_logs_service()

@router.websocket("/ws/training")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await handle_websocket_message(websocket, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/status")
async def get_training_status():
    """Kiểm tra trạng thái huấn luyện hiện tại."""
    return get_training_status_service()

@router.post("/create-dataset")
async def create_dataset():
    """
    Tạo cấu trúc dataset cho việc huấn luyện từ thư mục nguồn D:/vnese-id-management/dataset.
    Dữ liệu sẽ được tổ chức và chia thành các tập train, valid, test.
    """
    try:
        result = dataset_service.create_dataset_config()
        return JSONResponse(
            status_code=200,
            content=result
        )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "failed",
                "message": f"Lỗi khi tạo dataset: {str(e)}"
            }
        ) 