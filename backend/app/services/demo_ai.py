import re
from typing import Dict, Any, List, Optional
from app.models.schemas import StructuredHealthCard, SymptomCheckResponse, EmergencyAlert
from app.knowledge.knowledge_retriever import KnowledgeRetriever

class DemoMedicalAI:
    """
    Intelligent medical guidance simulation engine for Demo Mode.
    Ensures complete full-stack functionality without requiring an external API key.
    Provides safe, educational, structured responses in English and Hindi.
    """

    DEMO_PROMPTS_EN = {
        "fever_headache": {
            "summary": "Mild fever and headache can often occur together as part of the body's acute immune response to an infection or fatigue.",
            "possible_causes": [
                "Common viral upper respiratory infection or early viral flu",
                "Tension headache combined with physical fatigue or mild dehydration",
                "Sinus congestion or seasonal allergic response"
            ],
            "what_to_do": [
                "Drink plenty of fluids (water, ORS, herbal teas, or warm broths) to maintain hydration",
                "Get plenty of rest in a quiet, cool, well-ventilated room",
                "Apply a cool, damp washcloth to your forehead for headache relief",
                "If appropriate and not contraindicated, an over-the-counter fever reducer like Paracetamol may help manage discomfort"
            ],
            "things_to_watch": [
                "Temperature rising above 102°F (38.9°C) or not responding to fluids/rest",
                "Development of neck stiffness, sensitivity to bright light, or nausea",
                "Symptoms lasting more than 3 consecutive days without improvement"
            ],
            "when_to_see_doctor": [
                "Consult a doctor within 24 to 48 hours if fever persists beyond 3 days",
                "Seek immediate emergency care if you experience severe neck stiffness, confusion, rash, or intense vomiting"
            ],
            "clarifying_questions": [
                "Do you have any accompanying symptoms like a sore throat, runny nose, or body aches?",
                "Has your temperature been measured with a thermometer?",
                "Have you been exposed to anyone who recently had a viral illness or flu?"
            ]
        },
        "coughing": {
            "summary": "A cough lasting three days is typically in the acute phase and is commonly an airway clearing response to irritation or infection.",
            "possible_causes": [
                "Acute viral bronchitis or common cold infection",
                "Post-nasal drip from allergic rhinitis or sinus irritation",
                "Environmental irritation (dry air, smoke, dust, temperature changes)",
                "Mild acid reflux (GERD) irritating the vocal cords and throat"
            ],
            "what_to_do": [
                "Sip warm liquids such as herbal tea with 1 tsp of honey (for adults and children over 1 year)",
                "Use a cool-mist room humidifier or take a steamy shower to soothe airways",
                "Gargle with warm salt water (1/2 tsp salt in 1 glass of warm water) 2-3 times daily",
                "Avoid exposure to tobacco smoke, strong perfumes, and dusty environments"
            ],
            "things_to_watch": [
                "Cough progressively worsening or lingering beyond 2-3 weeks",
                "Production of thick dark green or rust-colored sputum",
                "Feeling short of breath or hearing whistling/wheezing sounds when breathing"
            ],
            "when_to_see_doctor": [
                "Schedule a clinical evaluation if the cough persists for more than 10-14 days or comes with a high fever",
                "Seek immediate emergency attention if you cough up blood or experience severe difficulty breathing"
            ],
            "clarifying_questions": [
                "Is your cough dry and tickly, or are you coughing up phlegm/mucus?",
                "Does the cough tend to be worse at night or after physical activity?",
                "Do you have a personal or family history of asthma or allergies?"
            ]
        },
        "tired_fatigue": {
            "summary": "Feeling constantly tired is a common concern that can stem from lifestyle rhythms, sleep architecture, nutritional status, or medical factors.",
            "possible_causes": [
                "Insufficient sleep duration, poor sleep quality, or sleep apnea",
                "Nutritional factors such as low iron (anemia), Vitamin D, or Vitamin B12 deficiency",
                "Chronic emotional stress, work burnout, or mild depressive mood",
                "Thyroid hormone imbalance (such as mild hypothyroidism)",
                "Dehydration or low physical activity level"
            ],
            "what_to_do": [
                "Establish a consistent sleep schedule: aim for 7-9 hours of uninterrupted sleep nightly",
                "Maintain steady daytime hydration with at least 2-2.5 liters of water",
                "Eat balanced meals rich in iron (leafy greens, legumes), protein, and complex carbohydrates",
                "Take a 15-20 minute brisk walk outdoors each day for natural daylight and circulation"
            ],
            "things_to_watch": [
                "Fatigue so profound that basic daily activities become difficult to perform",
                "Unintentional weight loss or gain, hair thinning, or constant feeling of cold",
                "Pale skin, shortness of breath on mild exertion, or feeling dizzy when standing"
            ],
            "when_to_see_doctor": [
                "Make an appointment with a primary care physician for routine blood panels (Complete Blood Count, Ferritin, Thyroid TSH, Vitamin B12, Vitamin D)",
                "Seek immediate emergency care if extreme weakness is sudden, one-sided, or accompanied by chest pain"
            ],
            "clarifying_questions": [
                "How many hours of sleep do you typically get each night, and do you wake up feeling refreshed?",
                "Has your diet or appetite changed recently?",
                "Are you experiencing any other symptoms like joint pains, dry skin, or low mood?"
            ]
        },
        "dehydration": {
            "summary": "Dehydration happens when fluid loss exceeds fluid intake, causing an electrolyte and fluid imbalance across body tissues.",
            "possible_causes": [
                "Inadequate daily fluid intake relative to climate or activity",
                "Excessive fluid loss from sweating in hot weather or during heavy exercise",
                "Fluid depletion following episodes of diarrhea, vomiting, or fever",
                "Use of diuretic medications or consumption of dehydrating drinks (alcohol/caffeine)"
            ],
            "what_to_do": [
                "Rehydrate gradually by sipping Oral Rehydration Solution (ORS) or electrolyte water",
                "Drink fresh coconut water, diluted fruit juices, or clear vegetable broths",
                "Move to a shaded or air-conditioned room and rest quietly",
                "Monitor urine color: aim for pale straw yellow rather than dark amber"
            ],
            "things_to_watch": [
                "Dry sticky mouth, lack of tears, or cracked lips",
                "Markedly dark, concentrated urine or no urination for more than 8 hours",
                "Feeling faint, dizzy, or lightheaded when standing up"
            ],
            "when_to_see_doctor": [
                "Seek same-day medical clinic care if you are unable to keep any fluids down due to vomiting",
                "Go to the emergency department immediately if there is confusion, rapid pulse, sunken eyes, or fainting"
            ],
            "clarifying_questions": [
                "Have you had recent vomiting, diarrhea, or high fever?",
                "When did you last urinate, and what color was it?",
                "Are you feeling dizzy when you stand up from sitting or lying down?"
            ]
        }
    }

    DEMO_PROMPTS_HI = {
        "fever_headache": {
            "summary": "हल्का बुखार और सिरदर्द अक्सर शरीर की संक्रमण या थकान के प्रति स्वाभाविक प्रतिरक्षा प्रतिक्रिया का हिस्सा होते हैं।",
            "possible_causes": [
                "सामान्य वायरल ऊपरी श्वसन संक्रमण या मौसमी फ्लू",
                "तनावपूर्ण सिरदर्द, अत्यधिक थकान या शरीर में पानी की कमी",
                "साइनस का दबाव या मौसमी एलर्जी"
            ],
            "what_to_do": [
                "खूब पानी, ओआरएस (ORS), सूप या हर्बल चाय पिएं ताकि शरीर में पानी की कमी न हो",
                "शांत और ठंडे कमरे में पूरा आराम करें",
                "सिरदर्द में राहत के लिए माथे पर ठंडे पानी की पट्टी रखें",
                "यदि आवश्यक हो, तो डॉक्टर की सलाह या लेबल निर्देशों के अनुसार पैरासिटामोल ले सकते हैं"
            ],
            "things_to_watch": [
                "बुखार का 102°F (38.9°C) से अधिक होना या 3 दिनों से अधिक समय तक लगातार बने रहना",
                "गर्दन में अकड़न, तेज रोशनी से परेशानी या लगातार उल्टी होना",
                "अत्यधिक सुस्ती या सांस लेने में परेशानी"
            ],
            "when_to_see_doctor": [
                "यदि बुखार 3 दिन से अधिक रहे तो 24-48 घंटों के भीतर डॉक्टर से मिलें",
                "गर्दन में तेज अकड़न, बेहोशी या त्वचा पर लाल चकत्ते दिखें तो तुरंत आपातकालीन अस्पताल जाएं"
            ],
            "clarifying_questions": [
                "क्या आपको गले में खराश, बहती नाक या बदन दर्द भी है?",
                "क्या आपने थर्मामीटर से तापमान नापा है?",
                "क्या परिवार में किसी अन्य सदस्य को भी बुखार है?"
            ]
        },
        "coughing": {
            "summary": "तीन दिनों से खांसी आमतौर पर सांस की नली में संक्रमण या जलन की प्रारंभिक अवस्था का संकेत होती है।",
            "possible_causes": [
                "सामान्य सर्दी-जुकाम या वायरल ब्रोंकाइटिस",
                "एलर्जी या धूल-मिट्टी के कारण गले में खराश",
                "एसिड रिफ्लक्स (गैस) जो गले तक पहुंच रही हो",
                "मौसम में बदलाव या शुष्क हवा"
            ],
            "what_to_do": [
                "गुनगुना पानी और 1 चम्मच शहद मिलाकर पिएं (1 वर्ष से बड़े व्यक्तियों के लिए)",
                "दिन में 2-3 बार गुनगुने नमक के पानी से गरारे करें",
                "गर्म पानी की भाप लें जिससे सांस की नली में जमाव कम हो",
                "धूल, धुएं और ठंडी चीजों से परहेज करें"
            ],
            "things_to_watch": [
                "खांसी का 2-3 सप्ताह से अधिक समय तक बने रहना",
                "गाढ़ा पीला या हरा बलगम आना, या सांस लेते समय सीटी जैसी आवाज आना",
                "खांसी के साथ तेज बुखार या सीने में जकड़न महसूस होना"
            ],
            "when_to_see_doctor": [
                "यदि खांसी 10-14 दिनों में ठीक न हो तो डॉक्टर से जांच करवाएं",
                "खांसी में खून आए या सांस लेने में अत्यधिक कठिनाई हो तो तुरंत आपातकालीन कक्ष में जाएं"
            ],
            "clarifying_questions": [
                "क्या खांसी सूखी है या बलगम वाली?",
                "क्या रात में या ठंडी हवा में खांसी बढ़ जाती है?",
                "क्या आपको पहले से अस्थमा या एलर्जी की समस्या है?"
            ]
        },
        "tired_fatigue": {
            "summary": "हर समय थकान महसूस होना अपर्याप्त नींद, पोषण की कमी, तनाव या अन्य शारीरिक कारणों से हो सकता है।",
            "possible_causes": [
                "नींद की कमी या खराब नींद की गुणवत्ता",
                "आयरन (हीमोग्लोबिन), विटामिन बी12 या विटामिन डी की कमी",
                "अत्यधिक मानसिक तनाव या शारीरिक कमजोरी",
                "थायरॉयड हार्मोन का असंतुलन (हाइपोथायरायडिज्म)",
                "शरीर में पानी की कमी (डिहाइड्रेशन)"
            ],
            "what_to_do": [
                "रोजाना 7 से 9 घंटे की नियमित और शांतिपूर्ण नींद लें",
                "दिनभर में पर्याप्त पानी पिएं (कम से कम 2 से 2.5 लीटर)",
                "हरी पत्तेदार सब्जियां, दालें, फल और पौष्टिक आहार लें",
                "रोजाना 15-20 मिनट हल्की धूप में टहलें"
            ],
            "things_to_watch": [
                "इतनी अधिक कमजोरी कि दैनिक काम करने में भी कठिनाई हो",
                "अचानक वजन घटना या बढ़ना, अत्यधिक ठंड लगना",
                "चेहरे पर पीलापन, चक्कर आना या दिल की धड़कन तेज होना"
            ],
            "when_to_see_doctor": [
                "डॉक्टर से मिलकर सामान्य रक्त जांच (सीबीसी, थायरॉयड, विटामिन बी12 और डी) करवाएं",
                "यदि अचानक एक तरफ की कमजोरी या सीने में भारीपन हो तो तुरंत आपातकालीन सहायता लें"
            ],
            "clarifying_questions": [
                "आप रात में कितने घंटे सोते हैं और क्या सोकर उठने पर ताजगी महसूस होती है?",
                "क्या आपकी भूख में कोई बदलाव आया है?",
                "क्या जोड़ों में दर्द या बाल झड़ने जैसी समस्याएं भी हैं?"
            ]
        },
        "dehydration": {
            "summary": "शरीर में पानी और आवश्यक लवणों (इलेक्ट्रोलाइट्स) की कमी होने पर डिहाइड्रेशन होता है।",
            "possible_causes": [
                "दिनभर में पर्याप्त पानी या तरल पदार्थ न पीना",
                "गर्मी में पसीना अधिक निकलना या धूप में काम करना",
                "उल्टी या दस्त के कारण शरीर से पानी निकलना",
                "अत्यधिक चाय, कॉफी या शराब का सेवन"
            ],
            "what_to_do": [
                "ओआरएस (ORS) या नींबू-पानी और नमक का घोल घूंट-घूंट करके पिएं",
                "नारियल पानी, छाछ या पतली दाल का पानी लें",
                "ठंडी और छायादार जगह पर आराम करें",
                "पेशाब के रंग पर ध्यान दें, इसे हल्का पीला होना चाहिए"
            ],
            "things_to_watch": [
                "मुंह का सूखना, होंठ फटना, या आंखों के नीचे गड्ढे पड़ना",
                "बहुत गहरा पीला पेशाब आना या 8 घंटे से पेशाब न होना",
                "खड़े होने पर चक्कर आना या कमजोरी महसूस होना"
            ],
            "when_to_see_doctor": [
                "यदि लगातार उल्टी के कारण कोई तरल पेट में न रुके तो तुरंत डॉक्टर के पास जाएं",
                "बेहोशी, भ्रम या बहुत तेज दिल की धड़कन होने पर तुरंत अस्पताल पहुंचे"
            ],
            "clarifying_questions": [
                "क्या आपको हाल ही में उल्टी या दस्त हुए हैं?",
                "आपने अंतिम बार पेशाब कब किया था?",
                "क्या खड़े होने पर आपको चक्कर आते हैं?"
            ]
        }
    }

    @classmethod
    def generate_chat_response(cls, message: str, language: str = "en") -> Dict[str, Any]:
        is_hi = (language == "hi")
        msg = message.lower()

        # Match specific demo patterns
        matched_key = None
        if any(w in msg for w in ["fever", "headache", "बुखार", "सिरदर्द"]):
            matched_key = "fever_headache"
        elif any(w in msg for w in ["cough", "coughing", "phlegm", "खांसी", "कफ"]):
            matched_key = "coughing"
        elif any(w in msg for w in ["tired", "fatigue", "exhausted", "low energy", "थकान"]):
            matched_key = "tired_fatigue"
        elif any(w in msg for w in ["dehydration", "thirsty", "dry mouth", "निर्जलीकरण", "पानी की कमी"]):
            matched_key = "dehydration"

        # Check knowledge base for general keywords
        guidelines = KnowledgeRetriever.find_clinical_guidelines(message)

        if matched_key:
            data = cls.DEMO_PROMPTS_HI[matched_key] if is_hi else cls.DEMO_PROMPTS_EN[matched_key]
        elif guidelines:
            g = guidelines[0]
            if is_hi:
                data = {
                    "summary": f"{g['topic'].capitalize()} के लक्षणों के संबंध में प्राथमिक स्वास्थ्य जानकारी।",
                    "possible_causes": [f"सामान्यतः {c} से जुड़ा हो सकता है" for c in g.get("potential_considerations", [])],
                    "what_to_do": g.get("comfort_measures", []),
                    "things_to_watch": g.get("monitoring_signs", []),
                    "when_to_see_doctor": [
                        "यदि लक्षण 2-3 दिनों में ठीक न हों तो चिकित्सक से परामर्श लें",
                        "गंभीर स्थिति में तुरंत आपातकालीन चिकित्सा सहायता प्राप्त करें"
                    ],
                    "clarifying_questions": [
                        "यह लक्षण कब से महसूस हो रहा है?",
                        "क्या इसके साथ कोई अन्य असुविधा भी है?"
                    ]
                }
            else:
                data = {
                    "summary": g.get("summary", "Overview of reported symptoms and health guidance."),
                    "possible_causes": g.get("potential_considerations", ["Common non-specific health conditions"]),
                    "what_to_do": g.get("comfort_measures", ["Stay well hydrated and get sufficient rest"]),
                    "things_to_watch": g.get("monitoring_signs", ["Watch for worsening severity or persistent discomfort"]),
                    "when_to_see_doctor": [
                        "Consult your physician if symptoms worsen or do not begin improving within 48 to 72 hours",
                        "Seek immediate medical attention if you experience severe distress or any red-flag signs"
                    ],
                    "clarifying_questions": [
                        "How long have you noticed these symptoms?",
                        "Have you experienced this in the past, or is this entirely new?"
                    ]
                }
        else:
            # General safe health response
            if is_hi:
                data = {
                    "summary": "आपके द्वारा बताए गए लक्षणों के आधार पर सामान्य स्वास्थ्य मार्गदर्शन नीचे दिया गया है।",
                    "possible_causes": [
                        "मौसम में बदलाव, थकान या सामान्य मौसमी संक्रमण",
                        "खान-पान या जीवनशैली में असंतुलन",
                        "मानसिक या शारीरिक तनाव"
                    ],
                    "what_to_do": [
                        "पर्याप्त मात्रा में पानी और पौष्टिक तरल पदार्थ लें",
                        "शरीर को भरपूर आराम दें और भारी तनाव से बचें",
                        "हल्का और सुपाच्य भोजन ग्रहण करें",
                        "यदि कोई दवा ले रहे हैं तो समय पर लें"
                    ],
                    "things_to_watch": [
                        "लक्षणों का धीरे-धीरे और अधिक गंभीर होना",
                        "तेज बुखार, सांस लेने में तकलीफ या असहनीय दर्द",
                        "सामान्य दैनिक कार्यों को करने में असमर्थता"
                    ],
                    "when_to_see_doctor": [
                        "यदि समस्या 48 घंटों से अधिक समय तक बनी रहे तो डॉक्टर से जांच कराएं",
                        "गंभीर या असामान्य लक्षण दिखने पर तुरंत नजदीकी अस्पताल पहुंचे"
                    ],
                    "clarifying_questions": [
                        "क्या आप बता सकते हैं कि यह समस्या कब शुरू हुई?",
                        "क्या आपने इसके लिए कोई दवा ली है?"
                    ]
                }
            else:
                data = {
                    "summary": "Based on your description, here is general safe, educational health guidance to help you understand your situation.",
                    "possible_causes": [
                        "Transient physiological reaction to fatigue, environmental stress, or mild viral infection",
                        "Mild dehydration or dietary changes",
                        "Musculoskeletal strain or postural tension"
                    ],
                    "what_to_do": [
                        "Ensure adequate hydration with water, herbal teas, or electrolyte fluids",
                        "Prioritize 7-8 hours of quality, uninterrupted rest",
                        "Keep a brief log of when the symptoms occur and what makes them better or worse",
                        "Avoid unverified home remedies or self-medicating with unprescribed medications"
                    ],
                    "things_to_watch": [
                        "Symptoms steadily intensifying or failing to improve after 2-3 days",
                        "Onset of sharp localized pain, persistent fever, or dizziness",
                        "Interference with breathing, swallowing, or sleep"
                    ],
                    "when_to_see_doctor": [
                        "Schedule a visit with your primary healthcare provider if symptoms persist or disrupt your daily activities",
                        "Seek urgent medical evaluation if severe red-flag warning signs develop"
                    ],
                    "clarifying_questions": [
                        "Could you share approximately how long you have been feeling this way?",
                        "Are there any other associated symptoms you have noticed?"
                    ]
                }

        disclaimer = (
            "यह जानकारी केवल शैक्षिक मार्गदर्शन के लिए है, चिकित्सा निदान नहीं। किसी भी संदेह या गंभीर स्थिति में हमेशा डॉक्टर से परामर्श लें।"
            if is_hi
            else "This information is educational and not medical advice or a diagnosis. Always consult a healthcare professional for persistent, severe, or worsening symptoms."
        )

        card = StructuredHealthCard(
            summary=data["summary"],
            possible_causes=data["possible_causes"],
            what_to_do=data["what_to_do"],
            things_to_watch=data["things_to_watch"],
            when_to_see_doctor=data["when_to_see_doctor"],
            clarifying_questions=data.get("clarifying_questions", []),
            disclaimer=disclaimer
        )

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
            "structured_data": card
        }

    @classmethod
    def generate_symptom_check(
        cls,
        main_symptom: str,
        duration: str,
        severity: int,
        age_group: str,
        associated_symptoms: List[str],
        existing_conditions: List[str],
        current_medications: Optional[str] = None,
        allergies: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        is_hi = (language == "hi")
        
        # Risk score calculation
        # Severity: 1-10
        risk_score = severity
        if age_group in ["Infant", "नवजात / शिशु"]:
            risk_score += 3
        elif age_group in ["Senior", "वरिष्ठ नागरिक (65+)"]:
            risk_score += 1.5
        
        if len(associated_symptoms) >= 3:
            risk_score += 1.5
        if existing_conditions and len(existing_conditions) > 0:
            risk_score += 1.5

        if risk_score >= 8:
            risk_level = "High" if not is_hi else "उच्च (High)"
            evaluation_timeframe = "Consult a physician or urgent care clinic within 12 to 24 hours." if not is_hi else "12 से 24 घंटों के भीतर डॉक्टर या आपातकालीन क्लिनिक से संपर्क करें।"
        elif risk_score >= 5:
            risk_level = "Moderate" if not is_hi else "मध्यम (Moderate)"
            evaluation_timeframe = "Schedule an evaluation with your healthcare provider within 2 to 3 days if not improving." if not is_hi else "यदि स्थिति में सुधार न हो तो 2 से 3 दिनों के भीतर डॉक्टर से परामर्श लें।"
        else:
            risk_level = "Low" if not is_hi else "कम (Low)"
            evaluation_timeframe = "Home supportive care is generally reasonable; consult a doctor if symptoms persist past 5-7 days." if not is_hi else "घर पर प्राथमिक देखभाल पर्याप्त है; यदि लक्षण 5-7 दिनों से अधिक रहें तो डॉक्टर से मिलें।"

        # Dynamic guidance synthesis
        if is_hi:
            possible_explanations = [
                f"{main_symptom} के साथ जुड़े सामान्य लक्षण अक्सर मौसमी संक्रमण या तनाव से संबंधित हो सकते हैं।",
                "शरीर की प्रतिरक्षा प्रणाली का सक्रिय होना या शारीरिक थकान।",
                "जीवनशैली, खानपान या मौसम का प्रभाव।"
            ]
            self_care = [
                "पर्याप्त मात्रा में पानी, नारियल पानी या ओआरएस पिएं।",
                "भरपूर आराम करें और भारी काम से बचें।",
                "हल्का और ताजा भोजन करें।"
            ]
            red_flags = [
                "सांस लेने में अत्यधिक कठिनाई या सीने में तेज दर्द।",
                "तेज बुखार जो 102°F से ऊपर रहे या दवा से न उतरे।",
                "चक्कर आना, बेहोशी या लगातार उल्टी होना।"
            ]
            rec_action = f"वर्तमान जोखिम स्तर {risk_level} है। {evaluation_timeframe}"
            disclaimer = "यह मूल्यांकन केवल शैक्षिक मार्गदर्शन के लिए है और कोई आधिकारिक चिकित्सा निदान नहीं है। किसी भी संदेह की स्थिति में तुरंत डॉक्टर से संपर्क करें।"
        else:
            possible_explanations = [
                f"Symptom patterns involving {main_symptom} commonly relate to viral or mild localized inflammation.",
                "Physiological stress response, sleep debt, or fluid balance changes.",
                "Environmental allergens or transient musculoskeletal/digestive reaction."
            ]
            self_care = [
                "Maintain steady oral hydration with water, clear broths, or electrolyte solutions.",
                "Ensure sufficient sleep (7-8 hours) and avoid strenuous physical strain.",
                "Keep a log of symptoms, duration, and any triggers to discuss with your healthcare provider."
            ]
            red_flags = [
                "Sudden shortness of breath, chest pressure, or wheezing.",
                "High fever exceeding 102°F (38.9°C) unresponsive to home care.",
                "Confusion, sudden severe headache, or repeated inability to keep liquids down."
            ]
            rec_action = f"Current calculated risk profile is {risk_level}. {evaluation_timeframe}"
            disclaimer = "This assessment is an educational triage aid and not a medical diagnosis. Always consult a licensed healthcare professional for clinical advice."

        return {
            "risk_level": risk_level,
            "severity_score": severity,
            "recommended_action": rec_action,
            "possible_explanations": possible_explanations,
            "self_care_steps": self_care,
            "red_flag_symptoms": red_flags,
            "evaluation_timeframe": evaluation_timeframe,
            "disclaimer": disclaimer
        }
