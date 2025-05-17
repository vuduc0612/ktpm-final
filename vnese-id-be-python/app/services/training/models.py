import os
import sys
from pathlib import Path
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Đường dẫn tuyệt đối đến thư mục chứa dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

# Mô hình dữ liệu cho các tham số huấn luyện
class TrainingParams(BaseModel):
    dataPath: str = Field(
        default=str(BASE_DIR / "dataset/corners"),
        description="Đường dẫn đến thư mục chứa dữ liệu"
    )
    batchSize: int = Field(default=16, description="Batch size")
    epochs: int = Field(default=3, description="Số epoch")
    learningRate: float = Field(default=0.01, description="Learning rate cho huấn luyện")
    pretrainedWeights: Optional[str] = Field(
        default="",
        description="Tên file weight đã có trong thư mục weights. Để trống sẽ sử dụng mặc định."
    )
    projectDir: str = Field(
        default=str(BASE_DIR),
        description="Thư mục cha lưu kết quả"
    )
    runName: str = Field(
        default="corner_detection",
        description="Tên thư mục con để lưu kết quả"
    )
    createDataset: bool = Field(
        default=False,
        description="Tạo mới dataset từ thư mục nguồn D:/vnese-id-management/dataset trước khi huấn luyện"
    ) 

class IdCardRegionMetrics(BaseModel):
    """Model chứa thông tin metrics của mô hình nhận diện góc CMND/CCCD."""
    epoch: int
    train_box_loss: float
    train_obj_loss: float
    train_cls_loss: float
    precision: float
    recall: float
    val_box_loss: float
    val_obj_loss: float
    val_cls_loss: float
    created_at: Optional[datetime] = None
    confusion_matrix_path: Optional[str] = None
    results_path: Optional[str] = None

class TrainingMetricsResult(BaseModel):
    """Model chứa kết quả huấn luyện và các thông số metrics."""
    metrics: List[IdCardRegionMetrics]
    latest_metrics: IdCardRegionMetrics
    max_precision: float
    max_recall: float
    max_mAP_50: float
    max_mAP_50_95: float
    avg_precision: float
    avg_recall: float
    total_epochs: int 