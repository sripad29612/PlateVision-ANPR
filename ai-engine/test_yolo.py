from ultralytics import YOLO
import cv2

# LOAD MODEL
model = YOLO("models/best.pt")

# LOAD IMAGE
image_path = "noplate.jpg"

# RUN DETECTION
results = model.predict(
    source=image_path,
    conf=0.20,
    save=True
)

print("Detection Completed")