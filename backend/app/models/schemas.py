from typing import List, Optional, Any, Dict, Literal
from pydantic import BaseModel, Field

class StructuredHealthCard(BaseModel):
    summary: str = Field(description="Brief overview summary of the situation")
    possible_causes: List[str] = Field(default_factory=list, description="Non-diagnostic potential associations")
    what_to_do: List[str] = Field(default_factory=list, description="Actionable immediate comfort/supportive steps")
    things_to_watch: List[str] = Field(default_factory=list, description="Warning signs or progression to monitor")
    when_to_see_doctor: List[str] = Field(default_factory=list, description="Clear medical evaluation timeframe")
    clarifying_questions: List[str] = Field(default_factory=list, description="Follow-up questions that could help clarify")
    disclaimer: str = Field(
        default="This information is educational and not medical advice or a diagnosis. Always consult a healthcare professional for persistent, severe, or worsening symptoms.",
        description="Mandatory medical disclaimer"
    )

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = Field(default=None, max_length=64)
    language: Literal["en", "hi"] = Field(default="en")

class EmergencyAlert(BaseModel):
    is_emergency: bool = True
    category: str
    headline: str
    immediate_actions: List[str]
    emergency_numbers: Dict[str, str]
    warning_banner: str

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    reply: str
    structured_data: Optional[StructuredHealthCard] = None
    is_emergency: bool = False
    emergency_alert: Optional[EmergencyAlert] = None
    mode: str = "demo" # "gemini" or "demo"
    created_at: str

class ChatMessageSchema(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    structured_data: Optional[Dict[str, Any]] = None
    is_emergency: bool = False
    created_at: str

class ConversationDetail(BaseModel):
    id: str
    title: str
    language: str
    created_at: str
    updated_at: str
    messages: List[ChatMessageSchema]

class ConversationSummary(BaseModel):
    id: str
    title: str
    language: str
    created_at: str
    updated_at: str
    message_count: int = 0
    last_message_preview: Optional[str] = None

class SymptomCheckRequest(BaseModel):
    main_symptom: str = Field(..., min_length=2, max_length=300)
    duration: str = Field(..., max_length=100)
    severity: int = Field(..., ge=1, le=10)
    age_group: str = Field(..., max_length=50) # Infant, Child, Teen, Adult, Senior
    associated_symptoms: List[str] = Field(default_factory=list, max_length=25)
    existing_conditions: List[str] = Field(default_factory=list, max_length=25)
    current_medications: Optional[str] = Field(default=None, max_length=300)
    allergies: Optional[str] = Field(default=None, max_length=300)
    language: Literal["en", "hi"] = Field(default="en")

class SymptomCheckResponse(BaseModel):
    id: str
    risk_level: str # "Low", "Moderate", "High", "Critical/Emergency"
    severity_score: int
    recommended_action: str
    possible_explanations: List[str]
    self_care_steps: List[str]
    red_flag_symptoms: List[str]
    evaluation_timeframe: str
    is_emergency: bool = False
    emergency_alert: Optional[EmergencyAlert] = None
    mode: str = "demo"
    created_at: str
    disclaimer: str

class MedicationDetail(BaseModel):
    id: str
    name: str
    generic_name: str
    drug_class: str
    common_uses: List[str]
    common_side_effects: List[str]
    important_precautions: List[str]
    known_interactions: List[str]
    overdose_warning: str
    educational_disclaimer: str

class HealthTip(BaseModel):
    id: int
    category: str
    title: str
    content: str
    action_item: str
