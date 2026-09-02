# 🚘 PlateVision-ANPR

### AI-Powered Automatic Number Plate Recognition System

PlateVision-ANPR is an AI-powered Automatic Number Plate Recognition (ANPR) system designed to detect and recognize vehicle license plates from images and live camera feeds.

The system combines computer vision, OCR, a Python AI engine, and a web-based dashboard to provide an end-to-end vehicle number plate recognition solution.

---

## 📌 Overview

PlateVision-ANPR captures vehicle images through a live camera or uploaded images, processes them using an AI-based detection pipeline, extracts the license plate text using OCR, and stores recognized plate information in a MongoDB database.

The project is designed as a modular system with three major components:

- 🎨 **Frontend** – User interface and live camera dashboard
- ⚙️ **Backend API** – Authentication, API services, and database management
- 🤖 **AI Engine** – License plate detection and OCR processing

---

## ✨ Features

### 🎥 Live Camera ANPR
- Accesses the user's webcam directly from the browser
- Displays a live camera feed
- Captures vehicle frames
- Sends captured images for plate recognition

### 🚗 Number Plate Detection
- Detects vehicle license plate regions
- Processes captured vehicle images
- Identifies the relevant plate area

### 🔤 OCR Recognition
- Extracts characters from detected license plates
- Uses PaddleOCR for optical character recognition
- Supports English license plate recognition

### 👤 User Authentication
- User registration
- User login
- JWT-based authentication
- Protected backend API routes

### 🗄️ Database Storage
- MongoDB Atlas database
- Stores recognized vehicle plate information
- Stores user information
- Provides persistent recognition history

### 📊 Surveillance Dashboard
- Live ANPR camera feed
- Captured feeds/history
- Plate search
- Recognition results
- System status information

---
### 🛠️ Technology Stack
🎨 Frontend
- React
- Vite
- JavaScript / TypeScript
- Tailwind CSS
- HTML5
- Browser MediaDevices API
- HTML5 Canvas

⚙️ Backend
- Node.js
- Express.js
- Mongoose
- MongoDB
- JWT Authentication
- CORS
- Nodemon

🤖 AI Engine
- Python
- FastAPI
- Uvicorn
- PaddleOCR
- OpenCV
- Computer Vision

🗄️ Database
- MongoDB Atlas

---
## ⚙️ Installation
```bash
# Clone the Repository
git clone https://github.com/sripad29612/PlateVision-ANPR.git
cd PlateVision-ANPR
```

---
## 🎯 Applications

PlateVision-ANPR can be adapted for various real-world applications:

- 🚗 **Smart Parking**: Automated vehicle identification for parking entry and exit systems.
- 🏢 **Campus Monitoring**: Monitoring vehicles entering and leaving educational institutions.
- 🛣️ **Traffic Monitoring**: Automated recognition of vehicle registration numbers for traffic management.
- 🏭 **Industrial Security**: Monitoring vehicles entering and leaving industrial facilities.
- 🏘️ **Residential Security**: Vehicle identification for gated communities and residential areas.
- 🚧 **Entry and Exit Management**: Automated vehicle registration at controlled access points.
