from fastapi import APIRouter, HTTPException, Path as FastAPIPath
from fastapi.responses import FileResponse
from typing import Optional, List
import os
from pathlib import Path

from app.models.metrics import IdCardRegionMetrics
from app.services.metrics_service import get_latest_zone_metric

# Thêm debug log
import sys
print("Initializing metrics router...", file=sys.stderr)

router = APIRouter()

# Đường dẫn tuyệt đối đến thư mục chứa dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

@router.get("/metrics-zone/latest", response_model=IdCardRegionMetrics)
async def get_latest_zone_metrics():
    """
    Lấy metric mới nhất (zone) từ file results.csv.
    """
    metric = get_latest_zone_metric()
    if metric is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy metrics.")
    return metric 

@router.get("/metrics-zone/image/{image_name}")
async def get_zone_image(image_name: str):
    """
    Lấy file ảnh từ thư mục corner_detection và trả về cho frontend.
    image_name: Tên file ảnh (ví dụ: results.png, confusion_matrix.png)
    """
    # Chỉ cho phép truy cập file từ thư mục corner_detection
    image_path = BASE_DIR / "corner_detection" / image_name
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy file ảnh {image_name}")
    
    return FileResponse(str(image_path))
