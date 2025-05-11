# Kế hoạch triển khai API cho mô hình huấn luyện YOLOv5

## 1. Phân tích yêu cầu
Cần phát triển 3 API chính:
- API huấn luyện mô hình
- API xem log huấn luyện (giao diện web)
- API xem kết quả huấn luyện

## 2. Cấu trúc tổ chức

```
app/
├── api/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── train.py         # API cho huấn luyện
│   │   └── results.py       # API cho xem kết quả và log
│   └── dependencies.py
├── core/
│   ├── __init__.py
│   ├── config.py
│   └── tasks.py             # Xử lý tác vụ nền
├── models/
│   ├── __init__.py
│   └── train.py             # Model cho dữ liệu huấn luyện
├── schemas/
│   ├── __init__.py
│   └── train.py             # Schema cho dữ liệu huấn luyện
├── services/
│   ├── __init__.py
│   └── yolo_service.py      # Logic xử lý YOLOv5
├── static/
│   ├── logs/                # Thư mục lưu log
│   └── results/             # Thư mục lưu kết quả
└── utils/
    ├── __init__.py
    └── file_utils.py        # Tiện ích xử lý file
```

## 3. Các API cần triển khai

### 3.1. API huấn luyện mô hình
- **Endpoint**: `POST /api/train/start`
- **Chức năng**: Nhận tham số huấn luyện, khởi chạy quá trình huấn luyện
- **Tham số**:
  - `data_path`: Đường dẫn đến thư mục dữ liệu
  - `num_classes`: Số lượng lớp
  - `class_names`: Tên các lớp
  - `img_size`: Kích thước ảnh (mặc định: 640)
  - `batch_size`: Batch size (mặc định: 16)
  - `epochs`: Số epoch (mặc định: 100)
  - `pretrained_weights`: Đường dẫn đến weights (tùy chọn)
  - `run_name`: Tên cho lần chạy

### 3.2. API xem log huấn luyện
- **Endpoint**: `GET /api/train/logs/{run_id}`
- **Chức năng**: Hiển thị log huấn luyện theo thời gian thực
- **Tham số**:
  - `run_id`: ID của lần huấn luyện

### 3.3. API xem kết quả huấn luyện
- **Endpoint**: `GET /api/train/results/{run_id}`
- **Chức năng**: Lấy thông tin kết quả huấn luyện
- **Tham số**:
  - `run_id`: ID của lần huấn luyện

### 3.4. API liệt kê các lần huấn luyện
- **Endpoint**: `GET /api/train/runs`
- **Chức năng**: Liệt kê tất cả các lần huấn luyện đã thực hiện

## 4. Kế hoạch triển khai

### 4.1. Chuẩn bị
- Tạo cấu trúc thư mục cho dự án
- Cập nhật models và schemas tương ứng
- Thêm thư viện cần thiết vào requirements.txt (torch, PyYAML)

### 4.2. Triển khai service layer
- Tạo YOLOv5Service để xử lý logic huấn luyện
- Tích hợp mã nguồn huấn luyện hiện có vào service
- Thêm hàm để khởi tạo và chạy quá trình huấn luyện
- Thêm hàm để theo dõi và lấy kết quả huấn luyện

### 4.3. Triển khai API routes
- Tạo routes cho huấn luyện
- Tạo routes cho xem log và kết quả
- Tích hợp với main.py

### 4.4. Triển khai xử lý bất đồng bộ
- Sử dụng BackgroundTasks của FastAPI để chạy huấn luyện không đồng bộ
- Lưu trạng thái huấn luyện vào cơ sở dữ liệu hoặc file
- Triển khai cơ chế theo dõi tiến trình huấn luyện

### 4.5. Triển khai giao diện xem log
- Tạo endpoint WebSocket để cập nhật log theo thời gian thực
- Tạo trang HTML đơn giản để hiển thị log
- Triển khai tính năng theo dõi tiến trình huấn luyện theo thời gian thực

### 4.6. Triển khai lưu trữ và hiển thị kết quả
- Tạo cấu trúc lưu trữ cho kết quả huấn luyện
- Triển khai API để truy xuất và hiển thị kết quả
- Thêm tính năng xem biểu đồ mất mát, độ chính xác

## 5. Các vấn đề cần lưu ý
- Xử lý bất đồng bộ cho quá trình huấn luyện (có thể mất nhiều thời gian)
- Lưu trữ và quản lý kết quả huấn luyện
- Bảo mật khi truy cập vào các tệp tin và thư mục
- Quản lý tài nguyên (CPU/GPU) khi có nhiều yêu cầu huấn luyện đồng thời
- Xử lý lỗi và cơ chế phục hồi khi quá trình huấn luyện bị gián đoạn

## 6. Công nghệ sử dụng
- FastAPI: Framework API chính
- SQLAlchemy: ORM cho cơ sở dữ liệu
- PyTorch: Framework deep learning
- YOLOv5: Mô hình phát hiện đối tượng
- WebSocket: Cho phép cập nhật log theo thời gian thực
- Celery (tùy chọn): Quản lý tác vụ nền và hàng đợi

## 7. Kế hoạch thời gian
1. Giai đoạn 1: Chuẩn bị và thiết kế - 2 ngày
2. Giai đoạn 2: Triển khai service layer - 3 ngày
3. Giai đoạn 3: Triển khai API routes - 2 ngày
4. Giai đoạn 4: Triển khai xử lý bất đồng bộ - 2 ngày
5. Giai đoạn 5: Triển khai giao diện và hoàn thiện - 3 ngày

Tổng thời gian dự kiến: 12 ngày 