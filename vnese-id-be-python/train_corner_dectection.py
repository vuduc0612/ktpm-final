import torch
import yaml
import os
from pathlib import Path

# Đường dẫn đến thư mục YOLOv5

YOLOV5_DIR = "D:/vnese-id-management/vnese-id-be-python/yolov5"  # Điều chỉnh nếu cần

# Tạo file cấu hình dataset
def create_dataset_config(data_path, num_classes, class_names):
    data_yaml = {
        'train': str(Path(data_path) / 'train/images'),
        'val': str(Path(data_path) / 'valid/images'),
        'test': str(Path(data_path) / 'test/images') if (Path(data_path) / 'test/images').exists() else '',
        'nc': num_classes,
        'names': class_names
    }
    
    # Lưu file cấu hình
    config_path = Path(data_path) / 'dataset.yaml'
    with open(config_path, 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False)
    
    return str(config_path)

if __name__ == "__main__":
    # Cấu hình dataset
    DATA_PATH = "D:/vnese-id-management/vnese-id-be-python/dataset/corners"  # Đường dẫn đến thư mục chứa dữ liệu
    NUM_CLASSES = 4  # Số lượng lớp
    CLASS_NAMES = ['top_left', 'top_right', 'bottom_left', 'bottom_right']  # Tên các lớp
    
    # Tạo file cấu hình
    data_config = create_dataset_config(DATA_PATH, NUM_CLASSES, CLASS_NAMES)
    
    # Cấu hình huấn luyện
    IMG_SIZE = 640  # Kích thước ảnh huấn luyện
    BATCH_SIZE = 16  # Batch size
    EPOCHS = 3  # Số epoch
    PRETRAINED_WEIGHTS = "D:/vnese-id-management/vnese-id-be-python/yolov5/runs/train/exp/weights/corner.pt"  # File weight đã có
    
    # Đường dẫn thư mục lưu kết quả
    PROJECT_DIR = "D:/vnese-id-management/vnese-id-be-python"  # Thư mục cha
    RUN_NAME = "corner_detection"  # Tên thư mục con để lưu kết quả
    
    # Tạo thư mục nếu chưa tồn tại
    os.makedirs(Path(PROJECT_DIR), exist_ok=True)
    
    # Thực hiện huấn luyện với project và name được chỉ định
    train_cmd = f"python {YOLOV5_DIR}/train.py --img {IMG_SIZE} --batch {BATCH_SIZE} --epochs {EPOCHS} --data {data_config} --weights {PRETRAINED_WEIGHTS} --project {PROJECT_DIR} --name {RUN_NAME} --exist-ok"
    
    #print(f"Thực hiện lệnh huấn luyện: {train_cmd}")
    os.system(train_cmd)