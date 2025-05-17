import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# Tải biến môi trường
load_dotenv()

# Đọc các biến môi trường với giá trị mặc định
APP_NAME = os.getenv("APP_NAME", "VNeseID API")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000, http://localhost:8000").split(",")

# Tạo một class để lưu trữ các cài đặt
class Settings(BaseModel):
    APP_NAME: str = APP_NAME
    APP_VERSION: str = APP_VERSION
    DEBUG: bool = DEBUG
    ALLOWED_ORIGINS: List[str] = ALLOWED_ORIGINS

# Tạo instance settings
settings = Settings() 