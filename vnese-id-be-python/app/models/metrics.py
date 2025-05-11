from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

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