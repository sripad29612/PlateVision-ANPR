from ultralytics import YOLO
model = YOLO("yolov8n.pt")

model.train(
    data="dataset/data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,
    name="license_plate_model"
)