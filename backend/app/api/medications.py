from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.knowledge.knowledge_retriever import KnowledgeRetriever
from app.models.schemas import MedicationDetail

router = APIRouter(prefix="/api/medications", tags=["medications"])

@router.get("", response_model=List[MedicationDetail])
def list_or_search_medications(
    q: Optional[str] = Query(None, description="Search query for medication name or use")
):
    results = KnowledgeRetriever.search_medications(q or "")
    return [MedicationDetail(**m) for m in results]

@router.get("/{name}", response_model=MedicationDetail)
def get_medication_detail(name: str):
    med = KnowledgeRetriever.get_medication_by_name(name)
    if not med:
        raise HTTPException(
            status_code=404,
            detail=f"Medication '{name}' not found in the current educational formulary."
        )
    return MedicationDetail(**med)
