from fastapi import APIRouter, UploadFile, File, Form
from collections import Counter
from ultralytics import YOLO
from pymongo import MongoClient
import cv2
import numpy as np
import easyocr
import re
import os
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# =========================================
# CREATE UPLOADS FOLDER
# =========================================

os.makedirs("uploads", exist_ok=True)

# =========================================
# MONGODB CONNECTION
# =========================================
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
if not os.getenv("MONGO_URI") and os.path.exists(_env_path):
    with open(_env_path, "r", encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

MONGO_URI = os.getenv("MONGO_URI")
client = None
db = None
plates_collection = None

if not MONGO_URI:
    print("Warning: MONGO_URI environment variable is not set.")
else:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client["platevision_ai"]
        plates_collection = db["detected_plates"]
    except Exception as e:
        print(f"MongoDB connection notice: {str(e)}")

# =========================================
# ADMIN LOGIN
# =========================================
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123") 

# =========================================
# LOAD YOLO MODEL
# =========================================

model = YOLO(
    "runs/detect/license_plate_model-3/weights/best.pt"
)
 

# =========================================
# LOAD OCR
# =========================================

reader = easyocr.Reader(['en'], gpu=False)

# =========================================
# CLEAN PLATE
# =========================================

def clean_plate(text):

    text = text.upper()

    text = re.sub(r'[^A-Z0-9]', '', text)

    text = text.replace("O", "0")
    text = text.replace("I", "1")
    text = text.replace("Q", "0")
    text = text.replace("Z", "2")

    return text
def fix_indian_plate(text):

    if len(text) < 10:
        return text

    text = list(text)

    # State code positions (0,1) must be letters
    text[0] = text[0].replace('0', 'O')
    text[1] = text[1].replace('0', 'O')

    # District code positions (2,3) must be digits
    text[2] = text[2].replace('O', '0')
    text[3] = text[3].replace('O', '0')
    text[2] = text[2].replace('I', '1')
    text[3] = text[3].replace('I', '1')
    text[2] = text[2].replace('L', '1')
    text[3] = text[3].replace('L', '1')

    return ''.join(text)

# =========================================
# INDIAN PLATE FORMAT
# =========================================
VALID_STATES = [

    "AP","TS","KA","TN",
    "MH","DL","GJ","RJ",
    "UP","MP","WB","HR",
    "PB","CG","OD","KL"

]

def indian_plate_format(text):

    pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'

    if not re.match(pattern, text):

        return False

    state = text[:2]

    return state in VALID_STATES

# =========================================
# LOGIN API
# =========================================

@router.post("/login")
async def login(

    username: str = Form(...),

    password: str = Form(...)

):

    if (

        username == ADMIN_USERNAME

        and

        password == ADMIN_PASSWORD

    ):

        return {

            "success": True,

            "message": "Login Success"

        }

    return {

        "success": False,

        "message": "Invalid Credentials"

    }

# =========================================
# DETECT API
# =========================================

@router.post("/detect")
async def detect_number_plate(

    file: UploadFile = File(...)

):

    filename = f"uploads/{datetime.now().timestamp()}.jpg"

    contents = await file.read()

    with open(filename, "wb") as f:

        f.write(contents)

    npimg = np.frombuffer(

        contents,

        np.uint8
    )

    image = cv2.imdecode(

        npimg,

        cv2.IMREAD_COLOR
    )

    if image is None:

        return {

            "plate": "Image Error"
        }

    # YOLO DETECTION
    results = model.predict(
        source=image,
        conf=0.10,
        imgsz=640,
        verbose=True
    )

    plate = None

    for result in results:
        print("Classes:", result.boxes.cls.cpu().numpy())
        boxes = result.boxes.xyxy.cpu().numpy()
        print("Class IDs:", result.boxes.cls.cpu().numpy())

        boxes = result.boxes.xyxy.cpu().numpy()
        print("Boxes Found:", len(boxes))

        for box in boxes:

            x1, y1, x2, y2 = map(
                int,
                box
            )

            pad = 30

            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)

            x2 = min(image.shape[1], x2 + pad)
            y2 = min(image.shape[0], y2 + pad)

            plate = image[
                y1:y2,
                x1:x2
            ]
            cv2.rectangle(
                image,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )
            

            break

    if plate is None:

        plate = image
    cv2.imwrite(
    f"uploads/crop_{datetime.now().timestamp()}.jpg",
    plate
    )

    # OCR PREPROCESS
    gray = cv2.cvtColor(
        plate,
        cv2.COLOR_BGR2GRAY
    )

    gray = cv2.equalizeHist(gray)

    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )
    thresh = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    enlarged = cv2.resize(
        thresh,
        None,
        fx=8,
        fy=8,
        interpolation=cv2.INTER_CUBIC
    )
    cv2.imwrite(
         "uploads/final_ocr_input.jpg",
    enlarged
    )

    # OCR
    results = reader.readtext(
        gray,
        allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        paragraph=False,
        detail=1

    )

    best_text = ""
    best_confidence = 0

    for result in results:

        text = result[1]
        confidence = result[2]

        cleaned = clean_plate(text)
        cleaned = fix_indian_plate(cleaned)
        if len(cleaned) > 10:
            cleaned = cleaned[:10]

        if indian_plate_format(cleaned):

            if confidence > best_confidence:

                best_text = cleaned
                best_confidence = confidence

    # FALLBACK
    if best_text == "" and len(results) > 0:

        sorted_results = sorted(
            results,
            key=lambda x: x[2],
            reverse=True
        )

        fallback = clean_plate(
            sorted_results[0][1]
        )

        best_text = fallback

    if best_text == "":

        best_text = "No Plate Found"

    # SAVE DATABASE
    cv2.imwrite(
        filename,
        image
    )
    plates_collection.insert_one({

        "plate_number": best_text,
        "image_path": filename,
        "time": datetime.now()

    })

    return {

        "plate": best_text,
        "image": filename

    }
         
# =========================================
# HISTORY API
# =========================================
@router.get("/history")
async def get_history():

    history = []

    data = plates_collection.find().sort(

        "time",

        -1
    )

    for item in data:

        history.append({

            "_id": str(item["_id"]),

            "plate_number": item.get(
                "plate_number"
            ),

            "image_path": item.get(
                "image_path"
            ),

            "time": str(
                item.get("time")
            )

        })

    return history

# =========================================
# DELETE ALL HISTORY
# =========================================

@router.delete("/delete-history")
async def delete_history():

    plates_collection.delete_many({})

    return {

        "message": "All History Deleted"
    }

# =========================================
# DELETE SINGLE HISTORY
# =========================================
@router.delete("/delete/{id}")
async def delete_single_history(

    id: str

):

    plates_collection.delete_one({

        "_id": ObjectId(id)

    })

    return {

        "message": "Deleted"

    }

# =========================================
# DASHBOARD STATS
# =========================================

@router.get("/dashboard")
async def dashboard_stats():

    total_detections = plates_collection.count_documents({})

    latest = plates_collection.find_one(
        sort=[("time", -1)]
    )

    latest_plate = "No Data"

    if latest:

        latest_plate = latest.get(
            "plate_number"
        )

    return {

        "total_detections":
            total_detections,

        "latest_plate":
            latest_plate

    }

# =========================
# GRAPH DATA
# =========================

@router.get("/graph-data")
async def graph_data():

    try:

        data = list(plates_collection.find())

        dates = []

        for item in data:

            time = item.get("time", "")

            if time:

                date_only = str(time)[:10]

                dates.append(date_only)

        count = Counter(dates)

        graph = []

        for key, value in count.items():

            graph.append({

                "date": key,

                "vehicles": value

            })

        graph.sort(
            key=lambda x: x["date"]
        )

        return graph

    except Exception as e:

        return {

            "error": str(e)

        }