import os
import sys
import torch
import numpy as np
from PIL import Image
from pathlib import Path
import shutil

# Sửa lại phần import helpers
from app.helpers import get_center_point, four_point_transform, class_Order, non_max_suppression_fast

from vietocr.tool.config import Cfg
from vietocr.tool.predictor import Predictor

# Các đường dẫn
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
YOLOV5_PATH = BASE_DIR / "yolov5"
WEIGHTS_DIR = BASE_DIR / "OCR/weights"
CORNER_MODEL_PATH = WEIGHTS_DIR / "corner.pt"
CONTENT_MODEL_PATH = WEIGHTS_DIR / "content.pt"
SAVE_DIR = BASE_DIR / "OCR/detection_results"

# Tạo thư mục lưu kết quả nếu chưa tồn tại
os.makedirs(SAVE_DIR, exist_ok=True)


config = Cfg.load_config_from_name("vgg_seq2seq")  # Hoặc "vgg_transformer"
config["cnn"]["pretrained"] = False
config["device"] = "cpu"  # Hoặc "cpu"
config["predictor"]["beamsearch"] = False
detector = Predictor(config)

# Hàm tải mô hình YOLO
def load_models():
    try:
        # Kiểm tra xem có tồn tại các file model không
        if not os.path.exists(CORNER_MODEL_PATH):
            print(f"Corner model not found at {CORNER_MODEL_PATH}", file=sys.stderr)
            return None, None
            
        if not os.path.exists(CONTENT_MODEL_PATH):
            print(f"Content model not found at {CONTENT_MODEL_PATH}", file=sys.stderr)
            return None, None
            
        # Tải mô hình
        corner_model = torch.hub.load(str(YOLOV5_PATH), "custom", path=str(CORNER_MODEL_PATH), source="local")
        content_model = torch.hub.load(str(YOLOV5_PATH), "custom", path=str(CONTENT_MODEL_PATH), source="local")
        print("Models loaded successfully")
        return corner_model, content_model
    except Exception as e:
        print(f"Error loading models: {e}", file=sys.stderr)
        return None, None

# Hàm xử lý và trích xuất thông tin
def extract_info(image: Image.Image):
    """Hàm xử lý nhận diện thông tin từ ảnh CCCD"""
    # Tải model nếu chưa tải
    CORNER_MODEL, CONTENT_MODEL = load_models()
    if CORNER_MODEL is None or CONTENT_MODEL is None:
        return {"error": "Models could not be loaded"}
    
    # Phát hiện góc
    CORNER = CORNER_MODEL(image)
    predictions = CORNER.pred[0]
    categories = predictions[:, 5].tolist()
    
    if len(categories) != 4:
        return {"error": "Detecting corner failed!"}

    # Lấy và xử lý các box góc
    boxes = class_Order(predictions[:, :4].tolist(), categories)
    center_points = np.asarray(list(map(get_center_point, boxes)))
    aligned = Image.fromarray(four_point_transform(image, center_points))

    # Phát hiện nội dung
    CONTENT = CONTENT_MODEL(aligned)
    predictions = CONTENT.pred[0]
    categories = predictions[:, 5].tolist()
    
    if (7 in categories and len(categories) < 10) or (7 not in categories and len(categories) < 9):
        return {"error": "Missing fields! Detecting content failed!"}
    
    # Xử lý các trường thông tin
    boxes = predictions[:, :4].tolist()
    boxes, categories = non_max_suppression_fast(np.array(boxes), categories, 0.7)
    boxes = class_Order(boxes, categories)
    
    # Xóa các file cũ trong thư mục lưu kết quả
    for f in os.listdir(SAVE_DIR):
        file_path = os.path.join(SAVE_DIR, f)
        if os.path.isfile(file_path):
            os.remove(file_path)
    
    # Trích xuất text và xử lý các trường
    FIELDS_DETECTED = []
    for index, box in enumerate(boxes):
        left, top, right, bottom = box
        cropped_image = aligned.crop((left, top, right, bottom))
        FIELDS_DETECTED.append(detector.predict(cropped_image).strip())
    
    # Xử lý và lưu ảnh avatar
    avt_image = aligned.crop((boxes[0][0], boxes[0][1], boxes[0][2], boxes[0][3]))    
    if avt_image:
        avt_image_filename = f"{FIELDS_DETECTED[1]}_avt.jpg"
        avt_image_path = os.path.join(SAVE_DIR, avt_image_filename)
        avt_image.save(avt_image_path)
        # Cập nhật đường dẫn avatar trong kết quả
        FIELDS_DETECTED[0] = f"http://localhost:8888/api/extraction/avatar/{avt_image_filename}"
    
    # Xử lý trường hợp đặc biệt cho địa chỉ
    if 7 in categories:
        FIELDS_DETECTED = (FIELDS_DETECTED[:6] + [FIELDS_DETECTED[7]] + 
                         [FIELDS_DETECTED[6] + ", " + FIELDS_DETECTED[7]] + 
                         [FIELDS_DETECTED[9]])
    
    # Tạo dictionary kết quả
    keys = ["image_avt", "id", "name", "dob", "gender", "nationality", "address", "place_of_birth", "expire_date"]
    data_dict = dict(zip(keys, FIELDS_DETECTED))
    return {"data": data_dict} 