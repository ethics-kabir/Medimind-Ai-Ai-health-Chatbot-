import os
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.services.ai_service import AIService
from app.security.config import history_access_enabled

router = APIRouter(prefix="/api", tags=["health"])
logger = logging.getLogger("medimind.health")

HEALTH_TIPS = [
    {
        "id": 1,
        "category": "Hydration",
        "title": "The Golden Rule of Daily Hydration",
        "content": "Adequate water intake regulates body temperature, keeps joints lubricated, prevents infections, and delivers nutrients to cells. Aim for 2 to 3 liters daily depending on activity level and climate.",
        "action_item": "Keep a refillable water bottle at your desk and sip regularly throughout the day."
    },
    {
        "id": 2,
        "category": "Sleep Hygiene",
        "title": "Consistent Circadian Rhythms",
        "content": "Going to bed and waking up at consistent times strengthens your internal circadian clock, improving deep sleep cycles and daytime cognitive performance.",
        "action_item": "Dim blue screens 45 minutes before sleep and keep your bedroom cool and dark."
    },
    {
        "id": 3,
        "category": "Physical Health",
        "title": "The 20-20-20 Rule for Screen Fatigue",
        "content": "Digital eye strain can cause headaches, blurred vision, and dry eyes. Rest your eyes every 20 minutes by looking at an object 20 feet away for at least 20 seconds.",
        "action_item": "Set a gentle reminder or posture break timer during long screen sessions."
    },
    {
        "id": 4,
        "category": "Immune Defense",
        "title": "Effective Hand Hygiene",
        "content": "Washing hands with soap and running water for at least 20 seconds is one of the most effective ways to prevent the spread of respiratory and gastrointestinal infections.",
        "action_item": "Wash hands thoroughly before meals and after arriving home from public transit."
    },
    {
        "id": 5,
        "category": "Mental Wellness",
        "title": "Box Breathing for Stress De-escalation",
        "content": "Controlled autonomic breathing directly lowers cortisol and regulates heart rate variability when feeling overwhelmed.",
        "action_item": "Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4 times."
    }
]

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Database health probe failed")
        db_status = "unavailable"

    is_demo = AIService.is_demo_mode()
    return {
        "status": "online",
        "app_name": "MediMind AI",
        "version": "1.0.0",
        "database": db_status,
        "ai_engine": "Demo Mode (Mock Medical Intelligence)" if is_demo else "Google Gemini API (Active)",
        "mode": "demo" if is_demo else "gemini",
        "history_access": "enabled" if history_access_enabled() else "restricted",
        "emergency_system": "ACTIVE (Pre-LLM Safety Layer Enabled)"
    }

@router.get("/health-tips")
def get_health_tips():
    return HEALTH_TIPS
