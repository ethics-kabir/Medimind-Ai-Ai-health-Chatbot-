import json
import datetime
import hmac
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.db_models import Conversation, ChatMessage
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationSummary,
    ConversationDetail,
    ChatMessageSchema,
    StructuredHealthCard
)
from app.safety.emergency_detector import EmergencyDetector
from app.services.ai_service import AIService
from app.security.config import history_access_enabled, get_admin_token

router = APIRouter(prefix="/api", tags=["chat"])

def _can_access_history(admin_token: Optional[str]) -> bool:
    if history_access_enabled():
        return True
    configured_token = get_admin_token()
    return bool(configured_token) and bool(admin_token) and hmac.compare_digest(configured_token, admin_token)

def _enforce_history_access(admin_token: Optional[str]) -> None:
    if not _can_access_history(admin_token):
        raise HTTPException(
            status_code=403,
            detail="Conversation history endpoints are disabled for unauthenticated access.",
        )

@router.post("/chat", response_model=ChatResponse)
def send_chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    x_admin_token: Optional[str] = Header(default=None),
):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    message_text = request.message.strip()

    # 1. Resolve or create conversation
    conv = None
    if request.conversation_id and _can_access_history(x_admin_token):
        conv = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
    
    if not conv:
        initial_title = message_text[:45] + ("..." if len(message_text) > 45 else "")
        conv = Conversation(
            title=initial_title,
            language=request.language
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2. Safety Layer: Check for Red-Flag / Emergency situation BEFORE contacting AI
    is_emergency, emergency_alert = EmergencyDetector.evaluate(message_text, request.language)

    user_msg = ChatMessage(
        conversation_id=conv.id,
        sender="user",
        content=message_text,
        is_emergency=is_emergency
    )
    db.add(user_msg)

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if is_emergency and emergency_alert:
        # Emergency response - Bypasses regular AI output
        action_text = "\n".join(f"- {act}" for act in emergency_alert.immediate_actions)
        emergency_reply = (
            f"{emergency_alert.warning_banner}\n\n"
            f"**{emergency_alert.headline}**\n\n"
            f"**तत्काल कदम (Immediate Actions):**\n{action_text}\n\n"
            f"**आपातकालीन नंबर (Emergency Numbers):**\n"
            f"- 112 (India unified emergency response; use your local number elsewhere)\n"
            f"- 108 (emergency ambulance where available in India); 102 (patient transport, availability varies by state)\n"
            f"- 14416 (India Tele-MANAS) / 988 (US/Canada crisis line)\n\n"
            "कृपया किसी भी प्रकार की देरी न करें और तुरंत निकटतम अस्पताल के आपातकालीन विभाग में जाएं।"
            if request.language == "hi" else
            f"{emergency_alert.warning_banner}\n\n"
            f"**{emergency_alert.headline}**\n\n"
            f"**IMMEDIATE CRITICAL ACTIONS:**\n{action_text}\n\n"
            f"**EMERGENCY HOTLINES:**\n"
            f"- 112 (India) / 911 (US/Canada), or your local emergency number\n"
            f"- 108 (India emergency ambulance where available); 102 (patient transport, availability varies by state)\n"
            f"- 14416 (India Tele-MANAS) / 988 (US/Canada crisis line)\n\n"
            "Do not wait for an online response. Seek in-person emergency medical care immediately."
        )

        asst_msg = ChatMessage(
            conversation_id=conv.id,
            sender="assistant",
            content=emergency_reply,
            structured_data=json.dumps(emergency_alert.model_dump()),
            is_emergency=True
        )
        db.add(asst_msg)
        conv.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(asst_msg)

        return ChatResponse(
            conversation_id=conv.id,
            message_id=asst_msg.id,
            reply=emergency_reply,
            structured_data=None,
            is_emergency=True,
            emergency_alert=emergency_alert,
            mode="safety_interceptor",
            created_at=now_iso
        )

    # 3. AI Service or Demo AI processing
    ai_result = AIService.process_chat(message_text, language=request.language)
    reply_text = ai_result["reply"]
    card_obj: StructuredHealthCard = ai_result["structured_data"]
    mode = ai_result.get("mode", "demo")

    asst_msg = ChatMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=reply_text,
        structured_data=json.dumps(card_obj.model_dump()),
        is_emergency=False
    )
    db.add(asst_msg)
    conv.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(asst_msg)

    return ChatResponse(
        conversation_id=conv.id,
        message_id=asst_msg.id,
        reply=reply_text,
        structured_data=card_obj,
        is_emergency=False,
        emergency_alert=None,
        mode=mode,
        created_at=now_iso
    )

@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(
    search: Optional[str] = Query(None, description="Search term in title"),
    db: Session = Depends(get_db),
    x_admin_token: Optional[str] = Header(default=None),
):
    _enforce_history_access(x_admin_token)
    query = db.query(Conversation)
    if search:
        query = query.filter(Conversation.title.ilike(f"%{search}%"))
    
    conversations = query.order_by(Conversation.updated_at.desc()).all()
    summaries = []
    for c in conversations:
        count = len(c.messages)
        last_preview = c.messages[-1].content[:60] if c.messages else None
        summaries.append(
            ConversationSummary(
                id=c.id,
                title=c.title,
                language=c.language,
                created_at=c.created_at.isoformat(),
                updated_at=c.updated_at.isoformat(),
                message_count=count,
                last_message_preview=last_preview
            )
        )
    return summaries

@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation_detail(
    conversation_id: str,
    db: Session = Depends(get_db),
    x_admin_token: Optional[str] = Header(default=None),
):
    _enforce_history_access(x_admin_token)
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages_schema = []
    for m in conv.messages:
        s_data = None
        if m.structured_data:
            try:
                s_data = json.loads(m.structured_data)
            except Exception:
                s_data = None

        messages_schema.append(
            ChatMessageSchema(
                id=m.id,
                conversation_id=m.conversation_id,
                sender=m.sender,
                content=m.content,
                structured_data=s_data,
                is_emergency=m.is_emergency,
                created_at=m.created_at.isoformat()
            )
        )

    return ConversationDetail(
        id=conv.id,
        title=conv.title,
        language=conv.language,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat(),
        messages=messages_schema
    )

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    x_admin_token: Optional[str] = Header(default=None),
):
    _enforce_history_access(x_admin_token)
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"status": "success", "message": f"Conversation {conversation_id} deleted."}

@router.delete("/conversations")
def clear_all_conversations(
    db: Session = Depends(get_db),
    x_admin_token: Optional[str] = Header(default=None),
):
    _enforce_history_access(x_admin_token)
    db.query(ChatMessage).delete()
    db.query(Conversation).delete()
    db.commit()
    return {"status": "success", "message": "All conversations and messages cleared."}
