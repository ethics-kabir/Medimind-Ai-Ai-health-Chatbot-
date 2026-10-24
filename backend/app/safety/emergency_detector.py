import re
from typing import Optional, Tuple
from app.models.schemas import EmergencyAlert

class EmergencyDetector:
    """
    Pre-LLM safety layer to intercept urgent red-flag situations
    deterministically before any LLM inference occurs.
    """

    PATTERNS = {
        "CARDIAC": {
            "regex": [
                r"\b(chest\s+pain|chest\s+pressure|chest\s+tightness|chest\s+heaviness)\b",
                r"\b(heart\s+attack|crushing\s+chest|pain\s+radiat(ing|es)?\s+to\s+(left\s+arm|jaw|neck|back))\b",
                r"\b(छाती\s+में\s+दर्द|सीने\s+में\s+दर्द|दिल\s+का\s+दौरा)\b",
            ],
            "title_en": "Critical Cardiac Warning: Potential Heart Emergency",
            "title_hi": "आपातकालीन चेतावनी: संभावित हृदय संकट",
            "actions_en": [
                "Call 112 in India, 911 in the US/Canada, or your local emergency number immediately.",
                "Chew an aspirin if recommended by emergency dispatchers and if you are not allergic.",
                "Sit down, stay calm, and loosen tight clothing.",
                "Do NOT attempt to drive yourself to the hospital."
            ],
            "actions_hi": [
                "तुरंत 112 या स्थानीय आपातकालीन सेवा को कॉल करें।",
                "आराम से बैठ जाएं, शांत रहें और तंग कपड़े ढीले करें।",
                "खुद गाड़ी चलाकर अस्पताल जाने की कोशिश न करें।",
                "तुरंत निकटतम आपातकालीन कक्ष में जाएं।"
            ]
        },
        "RESPIRATORY": {
            "regex": [
                r"\b(difficulty\s+breathing|can'?t\s+breathe|shortness\s+of\s+breath|gasping\s+for\s+air|suffocating)\b",
                r"\b(blue\s+lips|turning\s+blue|severe\s+asthma\s+attack|stridor|choking)\b",
                r"\b(सांस\s+लेने\s+में\s+तकलीफ|सांस\s+फूलना|दम\s+घुटना)\b",
            ],
            "title_en": "Respiratory Distress: Severe Breathing Emergency",
            "title_hi": "सांस संबंधी आपातकाल: तुरंत सहायता आवश्यक",
            "actions_en": [
                "Call 112 in India, 911 in the US/Canada, or your local emergency number immediately; or go to the nearest emergency department.",
                "Sit upright to keep airways open as much as possible.",
                "If prescribed a rescue inhaler (e.g., Albuterol/Salbutamol), use it immediately as directed.",
                "Have someone stay with you while emergency assistance arrives."
            ],
            "actions_hi": [
                "तुरंत 112 पर कॉल करें या नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं।",
                "सीधे बैठें ताकि सांस लेने का रास्ता खुला रहे।",
                "यदि आपके पास इनहेलर है तो उसका उपयोग करें।",
                "सहायता आने तक किसी को अपने साथ रखें।"
            ]
        },
        "STROKE_NEURO": {
            "regex": [
                r"\b(stroke|face\s+droop(ing)?|slurred\s+speech|speech\s+slurred|sudden\s+weakness|arm\s+numbness|paralysis)\b",
                r"\b(worst\s+headache\s+of\s+(my\s+)?life|thunderclap\s+headache|sudden\s+blindness|sudden\s+vision\s+loss)\b",
                r"\b(लकवा|चेहरा\s+टेढ़ा|बोलने\s+में\s+दिक्कत|स्ट्रोक)\b",
            ],
            "title_en": "Neurological Alert: Potential Stroke Signs (F.A.S.T.)",
            "title_hi": "न्यूरोलॉजिकल आपातकाल: स्ट्रोक के संभावित लक्षण",
            "actions_en": [
                "Call emergency medical services immediately (112 in India; 911 in the US/Canada). Time is critical for brain tissue.",
                "Check FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency.",
                "Note the exact time symptoms first started.",
                "Do NOT take aspirin, eat, or drink anything until evaluated by medical staff."
            ],
            "actions_hi": [
                "तुरंत भारत में 112 या अपने क्षेत्र की आपातकालीन चिकित्सा सेवा को कॉल करें।",
                "नोट करें कि लक्षण किस समय शुरू हुए।",
                "अस्पताल पहुंचने तक कुछ भी न खाएं और न पिएं।",
                "मरीज को स्थिर और शांत रखें।"
            ]
        },
        "CONSCIOUSNESS_SEIZURE": {
            "regex": [
                r"\b(lost\s+consciousness|passed\s+out|unconscious|fainted|blacked\s+out|unresponsive)\b",
                r"\b(having\s+a\s+seizure|seizures|convulsing|fit|epileptic\s+fit)\b",
                r"\b(बेहोश|बेहोशी|दौरा|मिरगी)\b",
            ],
            "title_en": "Medical Emergency: Altered Consciousness / Seizure",
            "title_hi": "गंभीर आपातकाल: बेहोशी या दौरे की स्थिति",
            "actions_en": [
                "Call 112 in India, 911 in the US/Canada, or your local emergency/ambulance service immediately.",
                "Place the person on their side in the recovery position if breathing.",
                "Do NOT put anything in their mouth during a seizure.",
                "Clear nearby objects to prevent injury and time the duration of the episode."
            ],
            "actions_hi": [
                "तुरंत 112 या 108 एम्बुलेंस सेवा (जहाँ उपलब्ध) को कॉल करें।",
                "मरीज को करवट के बल लिटाएं ताकि सांस की नली खुली रहे।",
                "दौरे के समय मुंह में कुछ भी न डालें।",
                "मरीज के आसपास की नुकीली चीजें हटा दें।"
            ]
        },
        "HEMORRHAGE_TRAUMA": {
            "regex": [
                r"\b(severe\s+bleeding|bleeding\s+profusely|vomiting\s+blood|coughing\s+(up\s+)?blood|blood\s+in\s+vomit)\b",
                r"\b(stab\s+wound|gunshot|uncontrolled\s+bleeding|arterial\s+bleed)\b",
                r"\b(खून\s+की\s+उल्टी|बहुत\s+ज्यादा\s+खून\s+बहना|खांसी\s+में\s+खून)\b",
            ],
            "title_en": "Trauma Alert: Severe Bleeding / Internal Hemorrhage",
            "title_hi": "आपातकालीन चेतावनी: अत्यधिक रक्तस्राव",
            "actions_en": [
                "Call emergency medical services immediately.",
                "Apply continuous firm, direct pressure on the bleeding wound with clean cloth.",
                "Elevate the wounded limb if possible, unless a fracture is suspected.",
                "Keep the patient lying down and warm to combat shock."
            ],
            "actions_hi": [
                "तुरंत नजदीकी अस्पताल या आपातकालीन सेवा को कॉल करें।",
                "साफ कपड़े से बहते खून पर सीधा दबाव बनाएं।",
                "मरीज को लेटाकर रखें और गर्म रखें।"
            ]
        },
        "ANAPHYLAXIS": {
            "regex": [
                r"\b(anaphyla(xis|ctic)|throat\s+swelling|throat\s+closing|lip\s+swelling|tongue\s+swelling|severe\s+allergic\s+reaction)\b",
                r"\b(hives\s+and\s+(trouble|difficulty)\s+breathing)\b",
                r"\b(गला\s+सूजना|गले\s+में\s+रुकावट|गंभीर\s+एलर्जी)\b",
            ],
            "title_en": "Severe Allergic Emergency: Potential Anaphylaxis",
            "title_hi": "गंभीर एलर्जी संकट: एनाफिलेक्सिस का खतरा",
            "actions_en": [
                "Use an Epinephrine auto-injector (EpiPen) immediately if prescribed.",
                "Call 112 in India, 911 in the US/Canada, or your local emergency number immediately, even if symptoms seem to improve after injection.",
                "Lie flat with legs raised, unless breathing is difficult (then sit upright).",
                "Do not stand or walk."
            ],
            "actions_hi": [
                "यदि एपिनेफ्रीन (EpiPen) उपलब्ध है, तो तुरंत लगाएं।",
                "तुरंत 112 पर कॉल करें।",
                "आराम से लेटें या सांस में तकलीफ हो तो सीधे बैठें।",
                "तुरंत निकटतम आपातकालीन विभाग पहुंचें।"
            ]
        },
        "PSYCHIATRIC_CRISIS": {
            "regex": [
                r"\b(suicid(e|al)|want\s+to\s+(kill\s+myself|end\s+my\s+life|die)|self\s*harm|overdose\s+myself|cut\s+myself)\b",
                r"\b(आत्महत्या|खुद\s+को\s+मारना|जान\s+देना)\b",
            ],
            "title_en": "Urgent Support: Crisis & Mental Health Assistance",
            "title_hi": "मानसिक स्वास्थ्य संकट: तत्काल सहायता उपलब्ध है",
            "actions_en": [
                "You are not alone. Please reach out to someone who can help right now.",
                "In India: Call Tele-MANAS at 14416 or 1800-891-4416 (24/7 toll-free).",
                "In USA / Canada: Call or text 988 (Suicide & Crisis Lifeline).",
                "International: Contact your local crisis hotline or go to the nearest emergency room.",
                "Please talk to a trusted friend, family member, or mental health professional."
            ],
            "actions_hi": [
                "आप अकेले नहीं हैं। कृपया तुरंत किसी की सहायता लें।",
                "भारत में: टेली-मानस हेल्पलाइन 14416 या 1800-891-4416 पर कॉल करें (24 घंटे निःशुल्क)।",
                "अमेरिका/कनाडा में: 988 पर कॉल या मैसेज करें।",
                "तुरंत किसी करीबी या डॉक्टर से संपर्क करें।"
            ]
        }
    }

    @classmethod
    def evaluate(cls, text: str, language: str = "en") -> Tuple[bool, Optional[EmergencyAlert]]:
        if not text:
            return False, None

        normalized = text.lower()

        for category, config in cls.PATTERNS.items():
            for pattern in config["regex"]:
                if re.search(pattern, normalized, re.IGNORECASE):
                    is_hi = (language == "hi")
                    headline = config["title_hi"] if is_hi else config["title_en"]
                    actions = config["actions_hi"] if is_hi else config["actions_en"]
                    banner = (
                        "🚨 तत्काल आपातकालीन चेतावनी: यह स्थिति जीवन के लिए गंभीर हो सकती है। तुरंत भारत में 112 या अपने क्षेत्र के आपातकालीन नंबर पर संपर्क करें!"
                        if is_hi
                        else "🚨 CRITICAL MEDICAL EMERGENCY: This situation requires immediate medical evaluation. Call 112 in India, 911 in the US/Canada, or your local emergency number, or go to the nearest Emergency Department immediately!"
                    )

                    alert = EmergencyAlert(
                        is_emergency=True,
                        category=category,
                        headline=headline,
                        immediate_actions=actions,
                        emergency_numbers={
                            "Emergency / Ambulance": "112 (India) / 911 (US/Canada) / local number",
                            "Ambulance Services": "108 emergency ambulance where available in India; 102 patient transport, availability varies by state",
                            "Crisis / Suicide Support": "14416 (India) / 988 (US)"
                        },
                        warning_banner=banner
                    )
                    return True, alert

        return False, None

