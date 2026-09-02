import cv2
import numpy as np
from ultralytics import YOLO
import easyocr
import re

# ==========================================
# LOAD YOLO MODEL
# ==========================================

model = YOLO("best.pt")

# ==========================================
# EASYOCR
# ==========================================

reader = easyocr.Reader(['en'], gpu=False)

# ==========================================
# CLEAN NUMBER PLATE
# ==========================================

def clean_plate(text):

    text = text.upper()

    text = re.sub(r'[^A-Z0-9]', '', text)

    # OCR fixes
    text = text.replace("O", "0")
    text = text.replace("Q", "0")
    text = text.replace("I", "1")
    text = text.replace("Z", "2")

    # Indian fixes
    if text.startswith("H"):
        text = "MH" + text[1:]

    if text.startswith("NH"):
        text = "MH" + text[2:]

    if len(text) > 10:
        text = text[:10]

    return text

# ==========================================
# CHECK INDIAN FORMAT
# ==========================================

def is_indian_plate(text):

    pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'

    return re.match(pattern, text)

# ==========================================
# START WEBCAM
# ==========================================

cap = cv2.VideoCapture(0)

# HD CAMERA QUALITY
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

print("================================")
print("PlateVision Webcam Started")
print("Press Q to Exit")
print("================================")

# ==========================================
# MAIN LOOP
# ==========================================

while True:

    success, frame = cap.read()

    if not success:
        break

    # ======================================
    # YOLO DETECTION
    # ======================================

    results = model(frame)

    for result in results:

        boxes = result.boxes

        for box in boxes:

            x1, y1, x2, y2 = box.xyxy[0]

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # DRAW RECTANGLE
            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                3
            )

            # ==================================
            # CROP PLATE
            # ==================================

            plate = frame[y1:y2, x1:x2]

            if plate.size == 0:
                continue

            # ==================================
            # IMAGE PROCESSING
            # ==================================

            gray = cv2.cvtColor(
                plate,
                cv2.COLOR_BGR2GRAY
            )

            # REMOVE NOISE
            gray = cv2.bilateralFilter(
                gray,
                11,
                17,
                17
            )

            # SHARPEN
            gray = cv2.equalizeHist(gray)

            # THRESHOLD
            gray = cv2.adaptiveThreshold(
                gray,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11,
                2
            )

            # ENLARGE
            gray = cv2.resize(
                gray,
                None,
                fx=4,
                fy=4,
                interpolation=cv2.INTER_CUBIC
            )

            # ==================================
            # OCR
            # ==================================

            detections = reader.readtext(

                gray,

                allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

            )

            best_plate = ""

            best_confidence = 0

            for detection in detections:

                text = detection[1]

                confidence = detection[2]

                cleaned = clean_plate(text)

                print("====================")
                print("RAW:", text)
                print("CLEAN:", cleaned)
                print("CONF:", confidence)
                print("====================")

                # VALIDATE INDIAN FORMAT
                if is_indian_plate(cleaned):

                    if confidence > best_confidence:

                        best_plate = cleaned

                        best_confidence = confidence

            # FALLBACK
            if best_plate == "" and len(detections) > 0:

                fallback = clean_plate(detections[0][1])

                best_plate = fallback

            # ==================================
            # SHOW TEXT
            # ==================================

            if best_plate != "":

                cv2.putText(

                    frame,

                    best_plate,

                    (x1, y1 - 10),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    1,

                    (0, 255, 0),

                    2

                )

    # ======================================
    # SHOW FRAME
    # ======================================

    cv2.imshow(

        "PlateVision AI Webcam",

        frame

    )

    # ======================================
    # EXIT
    # ======================================

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ==========================================
# CLEANUP
# ==========================================

cap.release()

cv2.destroyAllWindows() 