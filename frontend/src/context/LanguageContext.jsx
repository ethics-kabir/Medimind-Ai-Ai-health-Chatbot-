import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // App
    appName: "MediMind AI",
    tagline: "Your AI-powered health companion",
    subtitle: "Explore health information in a guided student-built demo.",
    demoBadge: "Demo mode",
    liveBadge: "Gemini API Active",
    emergencyAlertButton: "Emergency Help",

    // Nav
    navHome: "Home",
    navChat: "AI Health Chat",
    navSymptomChecker: "Symptom Checker",
    navMedications: "Medication Guide",
    navDashboard: "Health Dashboard",

    // Hero
    heroCheckSymptoms: "Check Symptoms",
    heroStartChat: "Talk to MediMind AI",
    disclaimerBanner: "Educational & Student Project Only: MediMind AI does not diagnose conditions, prescribe medications, or replace professional medical consultations. In emergencies, call 112 in India or your local emergency number.",

    // Sections
    howItWorksTitle: "How MediMind AI Works",
    featuresTitle: "Tools for a classroom demo",
    safetyFirstTitle: "Safety First Architecture",
    whyMediMindTitle: "Why Choose MediMind AI",
    faqTitle: "Frequently Asked Questions",

    // Chat
    chatPlaceholder: "Describe your symptoms or ask a health question...",
    send: "Send",
    newChat: "New Conversation",
    clearHistory: "Clear All History",
    searchChats: "Search conversations...",
    demoPromptsTitle: "Try sample questions:",
    copyResponse: "Copy response",
    copied: "Copied!",
    disclaimerLabel: "Medical Disclaimer",

    // Symptom Checker
    symptomCheckerTitle: "Interactive Symptom Assessment",
    symptomCheckerSubtitle: "Answer a few guided questions to see how the educational demo summarizes symptom information.",
    step1Title: "Primary Symptom & Duration",
    step2Title: "Severity & Age Demographics",
    step3Title: "Associated Symptoms & Medical History",
    step4Title: "Medications & Allergies",
    next: "Next Step",
    back: "Back",
    submitAssessment: "Analyze Symptoms Safely",
    analyzing: "Preparing educational guidance...",

    // Medications
    medicationsTitle: "Medication Information Guide",
    medicationsSubtitle: "Browse sample information about common medicines, possible side effects, precautions, and interactions.",
    searchMedicationPlaceholder: "Search by drug name or condition (e.g. Paracetamol, Ibuprofen, Allergy)...",
    drugClass: "Drug Class",
    commonUses: "Common Uses",
    sideEffects: "Common Side Effects",
    precautions: "Important Precautions",
    interactions: "Known Interactions",
    overdoseWarning: "Overdose & Urgent Warning",
    medicationDisclaimer: "Never stop, start, or alter prescription medications without consulting a licensed physician or pharmacist.",

    // Dashboard
    dashboardTitle: "Health Dashboard & History",
    dashboardSubtitle: "Review chat and symptom check records saved in the shared backend database.",
    recentConversations: "Recent Consultations",
    recentSymptomChecks: "Recent Symptom Assessments",
    dailyTips: "General Wellness Notes",
    emergencyHelplines: "Emergency Contact Directory",
    noHistory: "No saved records yet.",
    viewReport: "View Report",
    delete: "Delete",

    // Emergency Modal
    emergencyModalTitle: "CRITICAL EMERGENCY DETECTED",
    emergencyModalDesc: "Our pre-AI safety layer identified symptoms requiring immediate medical evaluation.",
    callAmbulance: "Call 112 (India) or your local emergency number",
    findHospital: "Seek Nearest Emergency Department",
  },
  hi: {
    // App
    appName: "MediMind AI",
    tagline: "आपका AI-संचालित स्वास्थ्य साथी",
    subtitle: "छात्रों द्वारा बनाए गए स्वास्थ्य जानकारी के डेमो को देखें।",
    demoBadge: "डेमो मोड",
    liveBadge: "Gemini API सक्रिय",
    emergencyAlertButton: "आपातकालीन सहायता",

    // Nav
    navHome: "होम",
    navChat: "AI स्वास्थ्य चैट",
    navSymptomChecker: "लक्षण जांच (Symptom Checker)",
    navMedications: "दवा निर्देशिका",
    navDashboard: "स्वास्थ्य डैशबोर्ड",

    // Hero
    heroCheckSymptoms: "लक्षण जांचें",
    heroStartChat: "MediMind AI से बात करें",
    disclaimerBanner: "केवल शैक्षिक एवं छात्र परियोजना: MediMind AI किसी बीमारी का निदान नहीं करता, न ही दवा लिखता है। आपातकालीन स्थिति में तुरंत 112 या नजदीकी अस्पताल से संपर्क करें।",

    // Sections
    howItWorksTitle: "MediMind AI कैसे काम करता है",
    featuresTitle: "क्लासरूम डेमो के लिए सुविधाएं",
    safetyFirstTitle: "सुरक्षा-प्रथम प्रणाली",
    whyMediMindTitle: "MediMind AI क्यों चुनें",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न (FAQ)",

    // Chat
    chatPlaceholder: "अपने लक्षणों का वर्णन करें या स्वास्थ्य संबंधी प्रश्न पूछें...",
    send: "भेजें",
    newChat: "नई बातचीत",
    clearHistory: "इतिहास मिटाएं",
    searchChats: "बातचीत खोजें...",
    demoPromptsTitle: "उदाहरण प्रश्न आजमाएं:",
    copyResponse: "कॉपी करें",
    copied: "कॉपी हो गया!",
    disclaimerLabel: "चिकित्सा अस्वीकरण",

    // Symptom Checker
    symptomCheckerTitle: "इंटरएक्टिव लक्षण मूल्यांकन",
    symptomCheckerSubtitle: "शैक्षिक डेमो में लक्षणों की जानकारी कैसे दिखाई जाती है, यह देखने के लिए कुछ सवालों के जवाब दें।",
    step1Title: "मुख्य लक्षण और अवधि",
    step2Title: "गंभीरता और आयु वर्ग",
    step3Title: "संबंधित लक्षण और पूर्व स्वास्थ्य इतिहास",
    step4Title: "वर्तमान दवाएं और एलर्जी",
    next: "अगला चरण",
    back: "पीछे जाएं",
    submitAssessment: "लक्षणों का सुरक्षित विश्लेषण करें",
    analyzing: "विश्लेषण जारी है...",

    // Medications
    medicationsTitle: "दवा जानकारी निर्देशिका",
    medicationsSubtitle: "सामान्य दवाओं, संभावित दुष्प्रभावों, सावधानियों और interactions के नमूने देखें।",
    searchMedicationPlaceholder: "दवा के नाम से खोजें (जैसे: पैरासिटामोल, आइबुप्रोफेन)...",
    drugClass: "दवा वर्ग (Drug Class)",
    commonUses: "सामान्य उपयोग",
    sideEffects: "संभावित दुष्प्रभाव",
    precautions: "महत्वपूर्ण सावधानियां",
    interactions: "दवाओं का परस्पर प्रभाव",
    overdoseWarning: "ओवरडोज चेतावनी",
    medicationDisclaimer: "डॉक्टर या फार्मासिस्ट की सलाह के बिना कभी भी कोई दवा शुरू, बंद या खुराक में बदलाव न करें।",

    // Dashboard
    dashboardTitle: "स्वास्थ्य डैशबोर्ड एवं इतिहास",
    dashboardSubtitle: "साझा backend database में सेव चैट और लक्षण जांच रिकॉर्ड देखें।",
    recentConversations: "हालिया परामर्श",
    recentSymptomChecks: "हालिया लक्षण मूल्यांकन",
    dailyTips: "सामान्य स्वास्थ्य नोट्स",
    emergencyHelplines: "आपातकालीन हेल्पलाइन नंबर",
    noHistory: "अभी कोई रिकॉर्ड सहेजा नहीं गया है।",
    viewReport: "रिपोर्ट देखें",
    delete: "हटाएं",

    // Emergency Modal
    emergencyModalTitle: "गंभीर आपातकालीन स्थिति का पता चला",
    emergencyModalDesc: "हमारे सुरक्षा फिल्टर ने ऐसे लक्षणों की पहचान की है जिसके लिए तुरंत आपातकालीन चिकित्सा देखभाल जरूरी है।",
    callAmbulance: "तुरंत 112 पर कॉल करें",
    findHospital: "निकटतम आपातकालीन अस्पताल जाएं",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('medimind_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('medimind_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

