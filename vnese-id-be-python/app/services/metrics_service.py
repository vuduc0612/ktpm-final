import os
import csv
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from app.models.metrics import IdCardRegionMetrics, TrainingMetricsResult


# Đường dẫn đến thư mục gốc của dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def get_training_zone_metrics(results_path: str = None) -> TrainingMetricsResult:
    """Lấy thông tin metrics từ kết quả huấn luyện (không dùng factory pattern)."""
    if results_path is None:
        results_path = BASE_DIR / "corner_detection" / "results.csv"
    results_path = Path(results_path)

    if not results_path.exists():
        # Trả về metrics mặc định nếu không có file
        default_metrics = IdCardRegionMetrics(
            epoch=0,
            train_box_loss=0.0,
            train_obj_loss=0.0,
            train_cls_loss=0.0,
            precision=0.0,
            recall=0.0,
            mAP_50=0.0,
            mAP_50_95=0.0,
            val_box_loss=0.0,
            val_obj_loss=0.0,
            val_cls_loss=0.0,
            timestamp=datetime.now()
        )
        return TrainingMetricsResult(
            metrics=[],
            latest_metrics=default_metrics,
            max_precision=0.0,
            max_recall=0.0,
            max_mAP_50=0.0,
            max_mAP_50_95=0.0,
            avg_precision=0.0,
            avg_recall=0.0,
            total_epochs=0
        )

    df = pd.read_csv(results_path)
    # Chuẩn hóa tên cột nếu có khoảng trắng
    df.columns = [c.strip() for c in df.columns]
    metrics_list = []
    for _, row in df.iterrows():
        metrics = IdCardRegionMetrics(
            epoch=int(row['epoch']),
            train_box_loss=float(row['train/box_loss']),
            train_obj_loss=float(row['train/obj_loss']),
            train_cls_loss=float(row['train/cls_loss']),
            precision=float(row['metrics/precision']),
            recall=float(row['metrics/recall']),
            mAP_50=float(row['metrics/mAP_0.5']),
            mAP_50_95=float(row['metrics/mAP_0.5:0.95']),
            val_box_loss=float(row['val/box_loss']),
            val_obj_loss=float(row['val/obj_loss']),
            val_cls_loss=float(row['val/cls_loss']),
            timestamp=datetime.now()
        )
        metrics_list.append(metrics)

    if not metrics_list:
        return TrainingMetricsResult(
            metrics=[],
            latest_metrics=None,
            max_precision=0.0,
            max_recall=0.0,
            max_mAP_50=0.0,
            max_mAP_50_95=0.0,
            avg_precision=0.0,
            avg_recall=0.0,
            total_epochs=0
        )

    latest_metrics = metrics_list[-1]
    max_precision = max(m.precision for m in metrics_list)
    max_recall = max(m.recall for m in metrics_list)
    max_mAP_50 = max(m.mAP_50 for m in metrics_list)
    max_mAP_50_95 = max(m.mAP_50_95 for m in metrics_list)
    avg_precision = sum(m.precision for m in metrics_list) / len(metrics_list)
    avg_recall = sum(m.recall for m in metrics_list) / len(metrics_list)
    total_epochs = max(m.epoch for m in metrics_list) + 1

    return TrainingMetricsResult(
        metrics=metrics_list,
        latest_metrics=latest_metrics,
        max_precision=max_precision,
        max_recall=max_recall,
        max_mAP_50=max_mAP_50,
        max_mAP_50_95=max_mAP_50_95,
        avg_precision=avg_precision,
        avg_recall=avg_recall,
        total_epochs=total_epochs
    )

def get_metrics_by_epoch(epoch: int, results_path: str = None) -> Optional[IdCardRegionMetrics]:
    """Lấy metrics của một epoch cụ thể."""
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
    metric = IdCardRegionMetrics(
        epoch=int(row['epoch']),
        train_box_loss=float(row['train/box_loss']),
        train_obj_loss=float(row['train/obj_loss']),
        train_cls_loss=float(row['train/cls_loss']),
        precision=float(row['metrics/precision']),
        recall=float(row['metrics/recall']),
        mAP_50=float(row['metrics/mAP_0.5']),
        mAP_50_95=float(row['metrics/mAP_0.5:0.95']),
        val_box_loss=float(row['val/box_loss']),
        val_obj_loss=float(row['val/obj_loss']),
        val_cls_loss=float(row['val/cls_loss']),
        timestamp=datetime.now()
    )
    return metric

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