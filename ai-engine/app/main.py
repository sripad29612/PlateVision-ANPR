from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.detect import router as detect_router

app = FastAPI()

# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# ROUTERS
# =========================================

app.include_router(detect_router)

# =========================================
# STATIC FILES
# =========================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)