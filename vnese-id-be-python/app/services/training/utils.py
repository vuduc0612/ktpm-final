import os
import re
import sys
import queue
import asyncio
import threading
import subprocess
from pathlib import Path

# Đường dẫn tuyệt đối đến thư mục chứa dự án
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
print(f"Base directory: {BASE_DIR}", file=sys.stderr)

# Cập nhật đường dẫn cho YOLOv5
YOLOV5_DIR = BASE_DIR / "yolov5"
print(f"YOLOv5 directory: {YOLOV5_DIR}", file=sys.stderr)

# Kiểm tra thư mục YOLOv5 tồn tại hay không
if not YOLOV5_DIR.exists():
    print(f"WARNING: YOLOv5 directory not found at {YOLOV5_DIR}", file=sys.stderr)

# Hàm để xóa mã ANSI color
def strip_ansi_codes(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

# Hàm để chạy trong thread riêng và xử lý đầu ra của subprocess
def process_output(process, queue_obj):
    for line in iter(process.stdout.readline, b''):
        if line:
            queue_obj.put(line)
    process.stdout.close()

def process_error(process, queue_obj):
    for line in iter(process.stderr.readline, b''):
        if line:
            queue_obj.put(line)
    process.stderr.close()

# Chạy một lệnh subprocess với tham số đầu vào
def run_command(cmd, output_queue=None):
    """
    Chạy một lệnh shell và trả về tiến trình.
    
    Args:
        cmd: Danh sách các tham số lệnh
        output_queue: Queue để đưa đầu ra vào (nếu có)
        
    Returns:
        Đối tượng subprocess.Popen
    """
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1,
        universal_newlines=False,
        shell=False
    )
    
    print(f"Process started with PID: {process.pid}", file=sys.stderr)
    
    if output_queue:
        # Tạo các thread để xử lý đầu ra
        stdout_thread = threading.Thread(
            target=process_output, 
            args=(process, output_queue)
        )
        stderr_thread = threading.Thread(
            target=process_error, 
            args=(process, output_queue)
        )
        
        # Bắt đầu thread xử lý đầu ra
        stdout_thread.daemon = True
        stderr_thread.daemon = True
        stdout_thread.start()
        stderr_thread.start()
    
    return process 