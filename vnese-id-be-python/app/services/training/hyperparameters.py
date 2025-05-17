import os
import sys
import yaml
from pathlib import Path

from .utils import BASE_DIR, YOLOV5_DIR

async def create_custom_hyperparameters(lr: float, base_hyp_path=None) -> str:
    """Tạo file hyperparameter với learning rate tùy chỉnh."""
    if base_hyp_path is None:
        # Sử dụng file hyp mặc định của YOLOv5
        base_hyp_path = YOLOV5_DIR / "data" / "hyps" / "hyp.scratch-low.yaml"
    
    if not os.path.exists(base_hyp_path):
        print(f"Warning: Base hyperparameter file not found at {base_hyp_path}", file=sys.stderr)
        # Tìm bất kỳ file hyp nào có sẵn
        hyp_files = list(Path(YOLOV5_DIR / "data" / "hyps").glob("*.yaml"))
        if hyp_files:
            base_hyp_path = hyp_files[0]
            print(f"Using alternative hyperparameter file: {base_hyp_path}", file=sys.stderr)
        else:
            # Tạo file hyp cơ bản nếu không tìm thấy
            print(f"No hyperparameter files found, creating basic one", file=sys.stderr)
            base_hyp = {
                "lr0": 0.01,
                "lrf": 0.01,
                "momentum": 0.937,
                "weight_decay": 0.0005,
                "warmup_epochs": 3.0,
                "warmup_momentum": 0.8,
                "warmup_bias_lr": 0.1,
                "box": 0.05,
                "cls": 0.5,
                "cls_pw": 1.0,
                "obj": 1.0,
                "obj_pw": 1.0,
                "iou_t": 0.2,
                "anchor_t": 4.0,
                "fl_gamma": 0.0,
                "hsv_h": 0.015,
                "hsv_s": 0.7,
                "hsv_v": 0.4,
                "degrees": 0.0,
                "translate": 0.1,
                "scale": 0.5,
                "shear": 0.0,
                "perspective": 0.0,
                "flipud": 0.0,
                "fliplr": 0.5,
                "mosaic": 1.0,
                "mixup": 0.0,
                "copy_paste": 0.0
            }
            custom_hyp = base_hyp.copy()
            custom_hyp["lr0"] = lr
            
            # Tạo thư mục nếu không tồn tại
            custom_hyp_dir = BASE_DIR / "custom_hyps"
            os.makedirs(custom_hyp_dir, exist_ok=True)
            
            # Lưu file hyperparameter tùy chỉnh
            custom_hyp_path = custom_hyp_dir / f"hyp_lr_{lr}.yaml"
            with open(custom_hyp_path, "w") as f:
                yaml.dump(custom_hyp, f)
            
            return str(custom_hyp_path)
    
    try:
        # Đọc file hyperparameter cơ bản
        with open(base_hyp_path, "r") as f:
            hyp = yaml.safe_load(f)
        
        # Sửa đổi learning rate
        hyp["lr0"] = lr
        
        # Tạo thư mục nếu không tồn tại
        custom_hyp_dir = BASE_DIR / "custom_hyps"
        os.makedirs(custom_hyp_dir, exist_ok=True)
        
        # Lưu file hyperparameter tùy chỉnh
        custom_hyp_path = custom_hyp_dir / f"hyp_lr_{lr}.yaml"
        with open(custom_hyp_path, "w") as f:
            yaml.dump(hyp, f)
        
        print(f"Created custom hyperparameter file with lr={lr} at {custom_hyp_path}", file=sys.stderr)
        return str(custom_hyp_path)
    except Exception as e:
        print(f"Error creating custom hyperparameter file: {e}", file=sys.stderr)
        return None 