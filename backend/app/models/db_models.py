import datetime
import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, default="New Consultation")
    language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False) # 'user' or 'assistant' or 'system'
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True) # JSON string of cards
    is_emergency = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    conversation = relationship("Conversation", back_populates="messages")

class SymptomCheck(Base):
    __tablename__ = "symptom_checks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    main_symptom = Column(String(255), nullable=False)
    duration = Column(String(100), nullable=False)
    severity = Column(Integer, nullable=False, default=1)
    age_group = Column(String(50), nullable=False)
    associated_symptoms = Column(Text, nullable=True) # JSON array
    existing_conditions = Column(Text, nullable=True) # JSON array
    current_medications = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    risk_level = Column(String(50), nullable=False) # Low, Moderate, High, Critical/Emergency
    result_json = Column(Text, nullable=False) # Full structured result JSON
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=get_utc_now)

class HealthProfile(Base):
    __tablename__ = "health_profile"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_key = Column(String(100), unique=True, nullable=False)
    profile_value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
