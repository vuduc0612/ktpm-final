# Ứng dụng Quản lý Căn cước Công dân Việt Nam

Backend API sử dụng FastAPI để quản lý thông tin căn cước công dân Việt Nam.

## Cài đặt

```bash
# Tạo môi trường ảo
python -m venv venv
source venv/bin/activate  # Trên Linux/Mac
# hoặc
venv\Scripts\activate  # Trên Windows

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt
```

## Khởi động ứng dụng

```bash
uvicorn app.main:app --reload
```

## Tài liệu API

Sau khi khởi động ứng dụng, bạn có thể truy cập tài liệu API tại:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 