import json
import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.db_models import SymptomCheck
from app.models.schemas import (
    SymptomCheckRequest,
    SymptomCheckResponse,
    EmergencyAlert
)
from app.safety.emergency_detector import EmergencyDetector
from app.services.demo_ai import DemoMedicalAI

router = APIRouter(prefix="/api", tags=["symptom-checker"])

@router.post("/symptom-check", response_model=SymptomCheckResponse)
def perform_symptom_check(request: SymptomCheckRequest, db: Session = Depends(get_db)):
    if not request.main_symptom or not request.main_symptom.strip():
        raise HTTPException(status_code=400, detail="Main symptom is required.")

    # 1. Pre-LLM Emergency Safety check on combined symptoms text
    combined_text = f"{request.main_symptom} " + " ".join(request.associated_symptoms)
    is_emergency, emergency_alert = EmergencyDetector.evaluate(combined_text, request.language)

    now_dt = datetime.datetime.now(datetime.timezone.utc)
    now_iso = now_dt.isoformat()

    if is_emergency and emergency_alert:
        # Emergency Red-Flag Triggered
        emergency_res = SymptomCheckResponse(
            id="emergency-" + uuid.uuid4().hex,
            risk_level="Critical/Emergency" if request.language != "hi" else "अत्यंत गंभीर / आपातकालीन",
            severity_score=max(request.severity, 9),
            recommended_action=emergency_alert.headline + ". " + " ".join(emergency_alert.immediate_actions),
            possible_explanations=[
                "Potential acute medical emergency requiring immediate evaluation.",
                "Clinical examination and rapid triage needed."
            ] if request.language != "hi" else [
                "संभावित गंभीर आपातकालीन स्थिति जिसके लिए तत्काल जांच की आवश्यकता है।",
                "तुरंत आपातकालीन कक्ष में डॉक्टर से मिलें।"
            ],
            self_care_steps=[
                "Do NOT attempt home treatment.",
                "Call 112 in India, 911 in the US/Canada, or your local emergency number immediately, or go to the nearest emergency room.",
                "Have someone remain with you."
            ] if request.language != "hi" else [
                "घर पर इलाज की कोशिश न करें।",
                "तुरंत 112 पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।",
                "किसी को अपने साथ रखें।"
            ],
            red_flag_symptoms=emergency_alert.immediate_actions,
            evaluation_timeframe="IMMEDIATE (Emergency Department)" if request.language != "hi" else "तत्काल (आपातकालीन विभाग)",
            is_emergency=True,
            emergency_alert=emergency_alert,
            mode="safety_interceptor",
            created_at=now_iso,
            disclaimer="CRITICAL ALERT: Seek emergency medical care immediately."
        )

        # Save to DB
        record = SymptomCheck(
            id=emergency_res.id,
            main_symptom=request.main_symptom,
            duration=request.duration,
            severity=request.severity,
            age_group=request.age_group,
            associated_symptoms=json.dumps(request.associated_symptoms),
            existing_conditions=json.dumps(request.existing_conditions),
            current_medications=request.current_medications,
            allergies=request.allergies,
            risk_level="Emergency",
            result_json=json.dumps(emergency_res.model_dump()),
            language=request.language
        )
        db.add(record)
        db.commit()

        return emergency_res

    # 2. Comprehensive non-emergency clinical analysis
    assessment = DemoMedicalAI.generate_symptom_check(
        main_symptom=request.main_symptom,
        duration=request.duration,
        severity=request.severity,
        age_group=request.age_group,
        associated_symptoms=request.associated_symptoms,
        existing_conditions=request.existing_conditions,
        current_medications=request.current_medications,
        allergies=request.allergies,
        language=request.language
    )

    check_id = "sc-" + uuid.uuid4().hex
    response_obj = SymptomCheckResponse(
        id=check_id,
        risk_level=assessment["risk_level"],
        severity_score=assessment["severity_score"],
        recommended_action=assessment["recommended_action"],
        possible_explanations=assessment["possible_explanations"],
        self_care_steps=assessment["self_care_steps"],
        red_flag_symptoms=assessment["red_flag_symptoms"],
        evaluation_timeframe=assessment["evaluation_timeframe"],
        is_emergency=False,
        emergency_alert=None,
        mode="demo",
        created_at=now_iso,
        disclaimer=assessment["disclaimer"]
    )

    # 3. Save to database
    record = SymptomCheck(
        id=check_id,
        main_symptom=request.main_symptom,
        duration=request.duration,
        severity=request.severity,
        age_group=request.age_group,
        associated_symptoms=json.dumps(request.associated_symptoms),
        existing_conditions=json.dumps(request.existing_conditions),
        current_medications=request.current_medications,
        allergies=request.allergies,
        risk_level=assessment["risk_level"],
        result_json=json.dumps(response_obj.model_dump()),
        language=request.language
    )
    db.add(record)
    db.commit()

    return response_obj

@router.get("/symptom-checks")
def get_symptom_checks(db: Session = Depends(get_db)):
    records = db.query(SymptomCheck).order_by(SymptomCheck.created_at.desc()).all()
    results = []
    for r in records:
        try:
            parsed = json.loads(r.result_json)
        except Exception:
            parsed = {}
        results.append({
            "id": r.id,
            "main_symptom": r.main_symptom,
            "duration": r.duration,
            "severity": r.severity,
            "age_group": r.age_group,
            "risk_level": r.risk_level,
            "created_at": r.created_at.isoformat(),
            "details": parsed
        })
    return results

@router.delete("/symptom-checks/{check_id}")
def delete_symptom_check(check_id: str, db: Session = Depends(get_db)):
    record = db.query(SymptomCheck).filter(SymptomCheck.id == check_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Symptom check not found")
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Symptom check {check_id} deleted."}

@router.delete("/symptom-checks")
def clear_all_symptom_checks(db: Session = Depends(get_db)):
    db.query(SymptomCheck).delete()
    db.commit()
    return {"status": "success", "message": "All symptom checks cleared."}


