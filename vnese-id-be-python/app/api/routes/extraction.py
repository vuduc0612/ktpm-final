from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import os
import io
from PIL import Image

from app.services.extraction_service import extract_info, SAVE_DIR

router = APIRouter()

@router.post("")
async def extract_info_endpoint(file: UploadFile = File(...)):
    """API nhận ảnh, xử lý và trả về thông tin trích xuất từ CCCD/CMND"""
    try:
        # Đọc và xử lý ảnh
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Trích xuất thông tin
        result = extract_info(image)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error processing image: {str(e)}"}
        )

@router.get("/avatar/{image_name}")
async def get_avatar(image_name: str):
    """API trả về ảnh avatar đã trích xuất"""
    image_path = os.path.join(SAVE_DIR, image_name)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    raise HTTPException(status_code=404, detail="Image not found") 