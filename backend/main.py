from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
import uvicorn
import os
from dotenv import load_dotenv
import sys
import firebase_admin
from firebase_admin import credentials

# 1. Load env vars immediately
load_dotenv()

# 2. Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), "firebase-service-account.json"))
    firebase_admin.initialize_app(cred)

# 3. Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 3. Import routers (they rely on GOOGLE_CLIENT_ID being in env now)
from routes import auth, resume, jobs

import contextlib
from database import db

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 [BACKEND] Starting up...")
    try:
        print(f"📂 [DB] Connecting to: {os.environ.get('DATABASE_URL')}")
        await db.connect()
        print("✅ [DB] Connected successfully.")
        yield
    except Exception as e:
        print(f"❌ [DB] Connection error: {e}")
        raise e
    finally:
        print("🛑 [BACKEND] Shutting down...")
        await db.disconnect()
        print("✅ [BACKEND] Disconnected.")

from rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler

# Setup App
app = FastAPI(title="AI Resume Analyzer API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)

from fastapi.staticfiles import StaticFiles
# Ensure uploads directory exists with absolute path
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount uploads directory to serve local storage fallback files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "Welcome to AI Resume Analyzer API"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
