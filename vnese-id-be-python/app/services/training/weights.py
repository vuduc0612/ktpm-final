import os
import sys
from pathlib import Path

from .utils import BASE_DIR, YOLOV5_DIR

async def get_pretrained_weights_path(weights_name: str) -> str:
    """
    Lấy đường dẫn đến file weights từ thư mục weights hoặc sử dụng mặc định.
    
    Args:
        weights_name: Tên file weight trong thư mục weights
        
    Returns:
        Đường dẫn đầy đủ đến file weights hoặc weights mặc định
    """
    # Thư mục chứa weights do người dùng upload
    weights_dir = BASE_DIR / "weights"
    
    # Nếu không có tên weights hoặc tên rỗng
    if not weights_name or weights_name.strip() == "":
        # Thử tìm file weights mặc định
        default_weights = YOLOV5_DIR / "runs/train/exp/weights/corner.pt"
        if default_weights.exists():
            print(f"Using default weights: {default_weights}", file=sys.stderr)
            return str(default_weights)
        else:
            # Tìm bất kỳ file weights nào trong thư mục weights
            user_weights = list(weights_dir.glob("*.pt"))
            if user_weights:
                print(f"Using found weights: {user_weights[0]}", file=sys.stderr)
                return str(user_weights[0])
            else:
                # Sử dụng weights YOLOv5 mặc định
                print("No custom weights found, using YOLOv5 default", file=sys.stderr)
                return "yolov5s.pt"
    
    # Kiểm tra nếu weights là đường dẫn đầy đủ
    if os.path.isfile(weights_name):
        return weights_name
    
    # Kiểm tra trong thư mục weights
    weights_path = weights_dir / weights_name
    if weights_path.exists():
        print(f"Found user-uploaded weights: {weights_path}", file=sys.stderr)
        return str(weights_path)
    
    # Kiểm tra nếu chỉ cung cấp tên file mà không có phần mở rộng
    if not weights_name.endswith(".pt"):
        weights_path = weights_dir / f"{weights_name}.pt"
        if weights_path.exists():
            print(f"Found user-uploaded weights: {weights_path}", file=sys.stderr)
            return str(weights_path)
    
    # Không tìm thấy, sử dụng YOLOv5 mặc định
    print(f"Weights '{weights_name}' not found, using YOLOv5 default", file=sys.stderr)
    return "yolov5s.pt" 