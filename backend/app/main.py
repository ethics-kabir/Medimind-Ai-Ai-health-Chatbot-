import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import Base, engine
from app.api import chat, symptom_checker, medications, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("medimind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("MediMind AI Backend ready.")
    yield
    logger.info("Shutting down MediMind AI Backend.")

app = FastAPI(
    title="MediMind AI - Health Assistant API",
    description="Educational full-stack health assistant with deterministic red-flag safety, symptom triage, medication library, and bilingual support.",
    version="1.0.0",
    lifespan=lifespan
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://localhost",
    ).split(",")
    if origin.strip()
]

# The app has no cookie-based login, so cross-origin credentials are not needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(chat.router)
app.include_router(symptom_checker.router)
app.include_router(medications.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {
        "app": "MediMind AI",
        "tagline": "Your AI-powered health companion",
        "scope": "Educational & Student Project - Strictly Non-Diagnostic",
        "emergency_advice": "For life-threatening emergencies, call 112 in India, 911 in the US/Canada, or your local emergency number.",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

