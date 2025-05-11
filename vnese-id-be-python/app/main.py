from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path

from app.api.routes import training
from app.core.config import settings

# Tải biến môi trường từ file .env
load_dotenv()

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API quản lý huấn luyện mô hình nhận diện góc CMND/CCCD",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm router training
app.include_router(training.router, prefix="/api/training", tags=["Training"])

# Đường dẫn đến thư mục static
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)

# Cấu hình phục vụ file tĩnh
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint trả về thông tin cơ bản của API
    """
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "API theo dõi huấn luyện mô hình nhận diện góc CMND/CCCD",
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8888, reload=True) 