import cv2
from deepface import DeepFace
import os

# ====== CẤU HÌNH ======
cccd_image_path = r"D:\vnese-id-management\vnese-id-be-python\OCR\detection_results\030203007050_avt.jpg"
selfie_image_path = "selfie.jpg"

# ====== CHỤP ẢNH TỪ WEBCAM ======
def capture_selfie(save_path):
    cap = cv2.VideoCapture(0)
    print("📷 Mở webcam... Nhấn 'SPACE' để chụp ảnh, 'ESC' để thoát.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Không thể đọc từ webcam.")
            break

        cv2.imshow("Nhấn SPACE để chụp", frame)
        key = cv2.waitKey(1)

        if key % 256 == 27:  # ESC
            print("👋 Đã thoát mà không chụp.")
            break
        elif key % 256 == 32:  # SPACE
            cv2.imwrite(save_path, frame)
            print(f"✅ Đã lưu ảnh selfie tại: {save_path}")
            break

    cap.release()
    cv2.destroyAllWindows()

# ====== XÁC THỰC KHUÔN MẶT ======
def verify_face(img1, img2):
    if not os.path.exists(img1) or not os.path.exists(img2):
        print("❌ Một trong hai ảnh không tồn tại.")
        return

    result = DeepFace.verify(
        img1_path=img1,
        img2_path=img2,
        model_name='ArcFace',
        detector_backend='retinaface',
        enforce_detection=True,
        distance_metric='cosine'
    )

    print("\n🧾 KẾT QUẢ XÁC THỰC:")
    print(f" - Trùng khớp (verified)? {result['verified']}")
    print(f" - Khoảng cách: {result['distance']:.4f}")
    print(f" - Ngưỡng xác thực: {result['threshold']:.4f}")

# ====== CHẠY LUỒNG CHÍNH ======
if __name__ == "__main__":
    capture_selfie(selfie_image_path)
    verify_face(cccd_image_path, selfie_image_path)
