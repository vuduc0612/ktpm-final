import os
import shutil
import random
from pathlib import Path
import re
from typing import List, Dict, Tuple, Optional

class DatasetService:
    """Service để xử lý và tổ chức lại dữ liệu huấn luyện."""
    
    def __init__(self):
        # Đường dẫn thư mục nguồn chứa dữ liệu ban đầu
        self.source_dir = Path("D:/vnese-id-management/dataset")
        
        # Đường dẫn thư mục đích trong dự án
        self.project_dir = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.target_dir = self.project_dir / "dataset" / "corners"
        
        # Đường dẫn đến các thư mục con
        self.train_dir = self.target_dir / "train"
        self.valid_dir = self.target_dir / "valid"
        self.test_dir = self.target_dir / "test"
        
        # Classes cho corner detection
        self.classes = ["top_left", "top_right", "bottom_left", "bottom_right"]
        
        # Tỷ lệ chia dữ liệu
        self.train_ratio = 0.7
        self.valid_ratio = 0.2
        self.test_ratio = 0.1
    
    def create_dataset_structure(self):
        """Tạo cấu trúc thư mục cho dataset."""
        # Reset thư mục dataset bằng cách xóa nó nếu đã tồn tại
        if os.path.exists(self.target_dir):
            print(f"Xóa thư mục cũ: {self.target_dir}")
            shutil.rmtree(self.target_dir)
        
        print(f"Tạo cấu trúc thư mục dataset mới tại: {self.target_dir}")
        
        # Tạo thư mục chính
        os.makedirs(self.target_dir, exist_ok=True)
        
        # Tạo thư mục train, valid, test và các thư mục con
        for dir_path in [self.train_dir, self.valid_dir, self.test_dir]:
            (dir_path / "images").mkdir(parents=True, exist_ok=True)
            (dir_path / "labels").mkdir(parents=True, exist_ok=True)
        
        # Tạo file classes.txt
        with open(self.target_dir / "classes.txt", "w") as f:
            f.write("\n".join(self.classes) + "\n")
        
        # Tạo file dataset.yaml
        yaml_content = f"""names:
- {self.classes[0]}
- {self.classes[1]}
- {self.classes[2]}
- {self.classes[3]}
nc: {len(self.classes)}
test: {self.test_dir / "images"}
train: {self.train_dir / "images"}
val: {self.valid_dir / "images"}
"""
        with open(self.target_dir / "dataset.yaml", "w") as f:
            f.write(yaml_content)
        
        print("Đã tạo xong cấu trúc thư mục dataset mới.")
    
    def process_txt_file(self, txt_file: Path) -> List[Tuple[int, float, float, float, float]]:
        """Đọc và xử lý file txt chứa thông tin label."""
        bboxes = []
        if not txt_file.exists():
            return bboxes
        
        with open(txt_file, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                parts = line.split()
                if len(parts) != 5:
                    continue
                
                try:
                    class_id = int(parts[0])
                    x_center = float(parts[1])
                    y_center = float(parts[2])
                    width = float(parts[3])
                    height = float(parts[4])
                    bboxes.append((class_id, x_center, y_center, width, height))
                except ValueError:
                    continue
        
        return bboxes
    
    def create_dataset_config(self):
        """Tạo cấu hình dataset từ thư mục nguồn."""
        # Tạo cấu trúc thư mục
        self.create_dataset_structure()
        
        # Lấy danh sách tất cả file ảnh trong thư mục nguồn
        image_files = list(self.source_dir.glob("*.jpg")) + list(self.source_dir.glob("*.png"))
        print(f"Tìm thấy {len(image_files)} file ảnh trong thư mục nguồn")
        
        # Đảm bảo file txt và file ảnh khớp nhau
        all_pairs = []
        for img_file in image_files:
            txt_file = self.source_dir / f"{img_file.stem}.txt"
            if txt_file.exists():
                all_pairs.append((img_file, txt_file))
        
        print(f"Tìm thấy {len(all_pairs)} cặp ảnh-label hợp lệ")
        
        # Shuffle dữ liệu để phân phối ngẫu nhiên
        random.shuffle(all_pairs)
        
        # Phân chia dữ liệu
        train_size = int(len(all_pairs) * self.train_ratio)
        test_size = int(len(all_pairs) * self.test_ratio)
        valid_size = len(all_pairs) - train_size - test_size
        
        print(f"Phân chia dữ liệu: {train_size} train, {valid_size} valid, {test_size} test")
        
        # Phân chia thành các tập riêng biệt
        train_pairs = all_pairs[:train_size]
        valid_pairs = all_pairs[train_size:train_size + valid_size]
        test_pairs = all_pairs[train_size + valid_size:]
        
        # Xử lý dữ liệu
        self._process_data_pairs(train_pairs, self.train_dir)
        self._process_data_pairs(valid_pairs, self.valid_dir)
        self._process_data_pairs(test_pairs, self.test_dir)
        
        print(f"Đã xử lý xong: {len(train_pairs)} train, {len(valid_pairs)} validation, {len(test_pairs)} test")
        return {
            "status": "success",
            "message": "Dataset đã được tạo thành công",
            "train_size": len(train_pairs),
            "valid_size": len(valid_pairs),
            "test_size": len(test_pairs)
        }
    
    def _process_data_pairs(self, data_pairs: List[Tuple[Path, Path]], target_dir: Path):
        """Xử lý và chuyển dữ liệu sang thư mục đích."""
        for img_file, txt_file in data_pairs:
            # Copy ảnh
            shutil.copy2(img_file, target_dir / "images" / img_file.name)
            
            # Copy label
            shutil.copy2(txt_file, target_dir / "labels" / txt_file.name)

# Singleton service instance
dataset_service = DatasetService() 