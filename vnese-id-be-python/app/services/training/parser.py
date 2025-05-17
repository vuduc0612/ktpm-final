import re
import sys
import asyncio
import traceback
import queue

from .utils import strip_ansi_codes
from .connection import manager

async def parse_training_output(output_queue):
    """Phân tích và định dạng đầu ra từ quá trình huấn luyện, gửi log theo block."""
    block_lines = []
    epoch_pattern = r"Epoch\s+(\d+)/(\d+)"
    metrics_pattern = r"(\w+)\s+([\d\.]+)(?!\S)"
    validation_pattern = r"Class\s+(\w+)\s+.*P\s+([\d\.]+)\s+R\s+([\d\.]+)\s+mAP50\s+([\d\.]+)\s+mAP50-95\s+([\d\.]+)"
    progress_pattern = r"(\d+)/(\d+)"
    completed_pattern = r"(\d+) epochs completed"
    while True:
        try:
            if manager.training_stopped:
                break
            try:
                line = output_queue.get(block=False)
                line = line.decode('utf-8').rstrip('\n')
                clean_line = strip_ansi_codes(line)
                
                # In ra terminal
                print(f"[TRAINING] {clean_line}", file=sys.stdout)
                
                # Gom block: nếu gặp dòng trống hoặc dòng phân cách, gửi block
                if clean_line.strip() == '' and block_lines:
                    await manager.broadcast({"type": "raw_log", "content": '\n'.join(block_lines)})
                    block_lines = []
                else:
                    block_lines.append(clean_line)

                # --- Phân tích các thông tin khác như cũ (epoch, metrics, v.v.) ---
                if "Epoch" in clean_line:
                    match = re.search(epoch_pattern, clean_line)
                    if match:
                        current_epoch, total_epochs = match.groups()
                        await manager.broadcast({
                            "type": "epoch_progress",
                            "current_epoch": int(current_epoch),
                            "total_epochs": int(total_epochs)
                        })
                elif re.search(progress_pattern, clean_line):
                    match = re.search(progress_pattern, clean_line)
                    if match:
                        current, total = match.groups()
                        try:
                            current_epoch = int(current)
                            total_epochs = int(total)
                            await manager.broadcast({
                                "type": "epoch_progress",
                                "current_epoch": current_epoch,
                                "total_epochs": total_epochs
                            })
                        except ValueError:
                            pass
                elif re.search(completed_pattern, clean_line):
                    match = re.search(completed_pattern, clean_line)
                    if match:
                        epochs = match.group(1)
                        print(f"Training completed with {epochs} epochs", file=sys.stderr)
                        await manager.broadcast({
                            "type": "status", 
                            "status": "completed",
                            "message": f"Hoàn thành {epochs} epochs"
                        })
                matches = re.findall(metrics_pattern, clean_line)
                if matches:
                    try:
                        metrics = {}
                        for metric, value in matches:
                            if value != '...' and re.match(r'^[\d\.]+$', value):
                                metrics[metric] = float(value)
                        if metrics:  # Chỉ gửi nếu có ít nhất một metric hợp lệ
                            await manager.broadcast({
                                "type": "metrics",
                                "metrics": metrics
                            })
                    except ValueError as e:
                        print(f"Lỗi chuyển đổi metric: {e}", file=sys.stderr)
                if "Class" in clean_line and "mAP50" in clean_line:
                    match = re.search(validation_pattern, clean_line)
                    if match:
                        try:
                            class_name, precision, recall, map50, map50_95 = match.groups()
                            # Kiểm tra tất cả giá trị có thể chuyển sang float không
                            if all(re.match(r'^[\d\.]+$', val) for val in [precision, recall, map50, map50_95]):
                                await manager.broadcast({
                                    "type": "validation",
                                    "class": class_name,
                                    "precision": float(precision),
                                    "recall": float(recall),
                                    "mAP50": float(map50),
                                    "mAP50-95": float(map50_95)
                                })
                        except ValueError as e:
                            print(f"Lỗi chuyển đổi dữ liệu validation: {e}", file=sys.stderr)
            except queue.Empty:
                await asyncio.sleep(0.1)
                continue
        except Exception as e:
            print(f"Error in parse_training_output: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            await asyncio.sleep(0.1)
    # Gửi block cuối cùng nếu còn
    if block_lines:
        await manager.broadcast({"type": "raw_log", "content": '\n'.join(block_lines)}) 