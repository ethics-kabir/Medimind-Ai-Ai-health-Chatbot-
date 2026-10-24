import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from app.models.schemas import StructuredHealthCard
from app.services.demo_ai import DemoMedicalAI
from app.knowledge.knowledge_retriever import KnowledgeRetriever

load_dotenv()
logger = logging.getLogger("medimind.ai")

SYSTEM_PROMPT_EN = """
You are MediMind AI, an empathetic, safe, educational AI health assistant designed for a student health-tech showcase.
You are NOT a doctor, and this is NOT a diagnostic system.

CRITICAL SAFETY & MEDICAL RULES:
1. NEVER provide a definitive medical diagnosis. Always discuss symptoms in terms of 'possible associations' or 'potential considerations'.
2. NEVER prescribe medications or tell users to start, stop, or alter dosages of prescription drugs.
3. NEVER impersonate a doctor or claim clinical authority.
4. Keep explanations understandable, calm, reassuring, and free of medical jargon where possible.
5. Emphasize uncertainty and the necessity of clinical examination, laboratory tests, or doctor visits for accurate diagnosis.
6. Provide structured information clearly separated into:
   - Summary overview
   - Possible causes (clearly non-diagnostic)
   - What you can do right now (comfort, hydration, rest, safe non-medicinal steps)
   - Things to watch for (red flags, worsening signs)
   - When to see a doctor (timelines and urgency)
   - Clarifying follow-up questions

You MUST respond strictly in valid JSON format matching this schema:
{
  "summary": "Brief empathetic summary of symptoms",
  "possible_causes": ["Potential possibility 1", "Potential possibility 2"],
  "what_to_do": ["Safe actionable step 1", "Safe actionable step 2"],
  "things_to_watch": ["Warning sign 1", "Warning sign 2"],
  "when_to_see_doctor": ["Medical timeframe recommendation 1", "Urgent sign 2"],
  "clarifying_questions": ["Clarifying question 1", "Clarifying question 2"],
  "disclaimer": "This information is educational and not medical advice or a diagnosis. Always consult a healthcare professional for persistent, severe, or worsening symptoms."
}
"""

SYSTEM_PROMPT_HI = """
आप MediMind AI हैं, एक सुरक्षित, संवेदनशील और शैक्षिक स्वास्थ्य सहायक।
आप एक डॉक्टर नहीं हैं, और यह कोई चिकित्सा निदान (डायग्नोसिस) प्रणाली नहीं है।

महत्वपूर्ण नियम:
1. कभी भी कोई निश्चित बीमारी का निदान (Diagnosis) न करें। केवल संभावित कारणों की चर्चा करें।
2. कभी भी दवाएं न लिखें या प्रिस्क्रिप्शन दवाओं को बदलने की सलाह न दें।
3. कभी भी खुद को डॉक्टर न बताएं।
4. सरल, समझने योग्य और संवेदनशील हिंदी भाषा (देवनागरी लिपि) में उत्तर दें।
5. अनावश्यक भय न पैदा करें।
6. डॉक्टर से परामर्श लेने के महत्व पर बल दें।

आपको अनिवार्य रूप से नीचे दिए गए JSON प्रारूप में ही उत्तर देना होगा:
{
  "summary": "लक्षणों का संक्षिप्त और संवेदनशील सारांश",
  "possible_causes": ["संभावित कारण 1", "संभावित कारण 2"],
  "what_to_do": ["घर पर प्राथमिक उपाय 1", "प्राथमिक उपाय 2"],
  "things_to_watch": ["ध्यान देने योग्य गंभीर लक्षण 1", "लक्षण 2"],
  "when_to_see_doctor": ["डॉक्टर से कब मिलें 1", "आपातकालीन स्थिति 2"],
  "clarifying_questions": ["स्थिति को स्पष्ट करने वाला प्रश्न 1", "प्रश्न 2"],
  "disclaimer": "यह जानकारी केवल शैक्षिक मार्गदर्शन के लिए है, चिकित्सा निदान नहीं। किसी भी संदेह या गंभीर स्थिति में हमेशा डॉक्टर से परामर्श लें।"
}
"""

class AIService:
    _client = None
    _api_key = None

    @classmethod
    def get_client(cls):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.strip() == "" or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return None
        
        if cls._client is None or cls._api_key != api_key:
            try:
                from google import genai
                cls._client = genai.Client(api_key=api_key)
                cls._api_key = api_key
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")
                return None
        return cls._client

    @classmethod
    def is_demo_mode(cls) -> bool:
        return cls.get_client() is None

    @classmethod
    def process_chat(cls, message: str, language: str = "en", history: Optional[list] = None) -> Dict[str, Any]:
        client = cls.get_client()
        
        # If no client, use Demo Medical AI engine
        if not client:
            result = DemoMedicalAI.generate_chat_response(message, language=language)
            result["mode"] = "demo"
            return result

        # Check knowledge base guidelines to ground the response
        guidelines = KnowledgeRetriever.find_clinical_guidelines(message)
        knowledge_context = ""
        if guidelines:
            knowledge_context = "\n\nVERIFIED CLINICAL KNOWLEDGE GUIDELINES:\n" + json.dumps(guidelines, indent=2)

        sys_prompt = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN
        full_prompt = f"{sys_prompt}\n{knowledge_context}\n\nUSER MESSAGE:\n{message}\n\nProvide your structured JSON response:"

        try:
            # Model selection: gemini-2.5-flash or gemini-1.5-flash
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )

            response_text = response.text.strip()
            # Clean possible markdown block wrappers if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            parsed = json.loads(response_text)
            card = StructuredHealthCard(
                summary=parsed.get("summary", "Health overview"),
                possible_causes=parsed.get("possible_causes", []),
                what_to_do=parsed.get("what_to_do", []),
                things_to_watch=parsed.get("things_to_watch", []),
                when_to_see_doctor=parsed.get("when_to_see_doctor", []),
                clarifying_questions=parsed.get("clarifying_questions", []),
                disclaimer=parsed.get("disclaimer", "Educational information only; consult a physician.")
            )

            is_hi = (language == "hi")
            reply_text = (
                f"{card.summary}\n\n"
                f"**संभावित कारण:**\n" + "\n".join(f"- {c}" for c in card.possible_causes) + "\n\n"
                f"**आप क्या कर सकते हैं:**\n" + "\n".join(f"- {w}" for w in card.what_to_do) + "\n\n"
                f"**सावधानी और लक्षण:**\n" + "\n".join(f"- {t}" for t in card.things_to_watch) + "\n\n"
                f"**डॉक्टर से कब मिलें:**\n" + "\n".join(f"- {d}" for d in card.when_to_see_doctor)
            ) if is_hi else (
                f"{card.summary}\n\n"
                f"**Possible Considerations:**\n" + "\n".join(f"- {c}" for c in card.possible_causes) + "\n\n"
                f"**What You Can Do Right Now:**\n" + "\n".join(f"- {w}" for w in card.what_to_do) + "\n\n"
                f"**Things to Watch For:**\n" + "\n".join(f"- {t}" for t in card.things_to_watch) + "\n\n"
                f"**When to See a Doctor:**\n" + "\n".join(f"- {d}" for d in card.when_to_see_doctor)
            )

            return {
                "reply": reply_text,
                "structured_data": card,
                "mode": "gemini"
            }

        except Exception as e:
            logger.error(f"Gemini API invocation error: {e}. Falling back to Demo Medical AI.", exc_info=True)
            result = DemoMedicalAI.generate_chat_response(message, language=language)
            result["mode"] = "demo"
            return result
