import os
import csv
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from app.services.training.models import IdCardRegionMetrics, TrainingMetricsResult


# Đường dẫn đến thư mục gốc của dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


def get_latest_zone_metric(results_path: str = None) -> Optional[IdCardRegionMetrics]:
    """Lấy metric mới nhất (IdCardRegionMetrics) từ file results.csv."""
    if results_path is None:
        results_path = BASE_DIR / "corner_detection" / "results.csv"
    results_path = Path(results_path)
    if not results_path.exists():
        return None

    df = pd.read_csv(results_path)
    df.columns = [c.strip() for c in df.columns]
    if df.empty:
        return None
    row = df.iloc[-1]
    confusion_matrix_filename = "confusion_matrix.png"
    results_filename = "results.png"
    metric = IdCardRegionMetrics(
        epoch=int(row['epoch']) + 1,
        train_box_loss=float(row['train/box_loss']),
        train_obj_loss=float(row['train/obj_loss']),
        train_cls_loss=float(row['train/cls_loss']),
        precision=float(row['metrics/precision']),
        recall=float(row['metrics/recall']),
        val_box_loss=float(row['val/box_loss']),
        val_obj_loss=float(row['val/obj_loss']),
        val_cls_loss=float(row['val/cls_loss']),
        created_at=datetime.now(),
        confusion_matrix_path=confusion_matrix_filename,
        results_path=results_filename
    )
    return metric 