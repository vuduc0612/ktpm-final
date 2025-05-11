FROM python:3.11-slim

WORKDIR /app/

# Cài đặt các gói cần thiết cho ứng dụng
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn
COPY . .

# Mở cổng cho ứng dụng
EXPOSE 8000

# Khởi động ứng dụng
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 