import React from 'react';
import {
  Activity,
  ArrowRight,
  BookOpenText,
  Bot,
  Check,
  ChevronRight,
  Database,
  HeartPulse,
  MessageCircle,
  Pill,
  Server,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const capabilities = [
  {
    id: 'chat',
    icon: MessageCircle,
    number: '01',
    title: 'Health chat',
    description: 'Ask a health question and get a clear, structured educational response.',
    color: 'mint',
  },
  {
    id: 'symptom-checker',
    icon: Activity,
    number: '02',
    title: 'Symptom check',
    description: 'Walk through a short form about a symptom, its duration, and severity.',
    color: 'blue',
  },
  {
    id: 'medications',
    icon: Pill,
    number: '03',
    title: 'Medicine guide',
    description: 'Browse a small reference library with uses, cautions, and interactions.',
    color: 'peach',
  },
  {
    id: 'dashboard',
    icon: Database,
    number: '04',
    title: 'Activity history',
    description: 'Review or clear the conversations and symptom checks saved by the API.',
    color: 'lavender',
  },
];

export default function LandingPage({ onNavigate, onOpenEmergency, apiStatus }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="landing-page">
      <section className="landing-hero page-container">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>{isHi ? 'AI APPLICATIONS LAB · PYTHON' : 'AI APPLICATIONS LAB · PYTHON'}</span>
          </div>
          <h1>
            {isHi ? 'स्वास्थ्य के सवालों के लिए' : 'A clearer way to'}
            <span>{isHi ? 'एक स्पष्ट शुरुआत।' : 'start a health question.'}</span>
          </h1>
          <p className="hero-description">
            {isHi
              ? 'MediMind एक शैक्षिक AI प्रोजेक्ट है। यह सरल भाषा में सामान्य स्वास्थ्य जानकारी देता है और ज़रूरत पड़ने पर पेशेवर मदद लेने की सलाह देता है।'
              : 'MediMind is a student-built health information app. Explore a guided symptom form, a conversational demo, and a small medicine reference library.'}
          </p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onNavigate('symptom-checker')}>
              <Activity size={17} />
              {isHi ? 'लक्षण जांचें' : 'Try the symptom check'}
              <ArrowRight size={16} />
            </button>
            <button className="button button-secondary" onClick={() => onNavigate('chat')}>
              <MessageCircle size={17} />
              {isHi ? 'चैट खोलें' : 'Open health chat'}
            </button>
          </div>

          <div className="hero-note">
            <ShieldAlert size={16} />
            <span>
              {isHi
                ? 'आपातकाल में ऑनलाइन सलाह की प्रतीक्षा न करें।'
                : 'For an emergency, call your local emergency number now.'}
            </span>
            <button onClick={onOpenEmergency}>
              {isHi ? 'आपातकालीन विकल्प' : 'Emergency options'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="hero-art" aria-label="MediMind response preview">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-center-mark">
            <HeartPulse size={44} strokeWidth={1.5} />
          </div>
          <div className="preview-card preview-top">
            <div className="preview-icon"><Bot size={17} /></div>
            <div>
              <strong>{isHi ? 'शैक्षिक AI सहायक' : 'Health information assistant'}</strong>
              <span>{apiStatus === 'offline'
                ? (isHi ? 'Backend से कनेक्शन नहीं है' : 'Backend is not connected')
                : apiStatus === 'live'
                  ? (isHi ? 'Gemini API सक्रिय' : 'Gemini API connected')
                  : (isHi ? 'डेमो मोड · बिना API कुंजी' : 'Demo mode · no API key needed')}</span>
            </div>
            <span className="status-dot" />
          </div>
          <div className="preview-card preview-bottom">
            <span className="preview-kicker">{isHi ? 'जवाब का प्रारूप' : 'A useful response includes'}</span>
            <div className="preview-check"><Check size={14} /> {isHi ? 'संभावित कारण' : 'Possible explanations'}</div>
            <div className="preview-check"><Check size={14} /> {isHi ? 'अभी क्या करें' : 'What you can do now'}</div>
            <div className="preview-check"><Check size={14} /> {isHi ? 'कब मदद लें' : 'When to seek care'}</div>
          </div>
          <div className="art-caption">MEDIMIND <span>·</span> STUDENT PROJECT</div>
        </div>
      </section>

      <section className="capabilities-section page-container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{isHi ? 'ऐप में क्या है' : 'BUILT FOR A HANDS-ON DEMO'}</span>
            <h2>{isHi ? 'एक ही जगह पर ज़रूरी टूल' : 'The main parts, all in one place'}</h2>
          </div>
          <p>{isHi ? 'हर सुविधा को खोलकर देखें।' : 'Choose a tool to explore how the frontend and Python API work together.'}</p>
        </div>

        <div className="capability-grid">
          {capabilities.map(({ id, icon: Icon, number, title, description, color }) => (
            <button className="capability-card" key={id} onClick={() => onNavigate(id)}>
              <span className={`capability-icon ${color}`}><Icon size={20} /></span>
              <span className="capability-number">{number}</span>
              <strong>{isHi ? ({ chat: 'स्वास्थ्य चैट', 'symptom-checker': 'लक्षण जांच', medications: 'दवा गाइड', dashboard: 'गतिविधि इतिहास' }[id]) : title}</strong>
              <span className="capability-description">{isHi ? ({ chat: 'सामान्य स्वास्थ्य सवाल पूछें और संरचित शैक्षिक जवाब देखें।', 'symptom-checker': 'लक्षण, अवधि और गंभीरता के बारे में कुछ छोटे सवालों के जवाब दें।', medications: 'सामान्य दवाओं की जानकारी, सावधानियां और interactions पढ़ें।', dashboard: 'API में सेव चैट और लक्षण-जांच रिकॉर्ड देखें या मिटाएं।' }[id]) : description}</span>
              <span className="card-link">{isHi ? 'खोलें' : 'Open'} <ArrowRight size={15} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="project-section page-container">
        <div className="project-panel">
          <div className="project-intro">
            <span className="section-kicker section-kicker-light">{isHi ? 'प्रोजेक्ट आर्किटेक्चर' : 'HOW THE PROJECT WORKS'}</span>
            <h2>{isHi ? 'Python API के पीछे की प्रक्रिया' : 'A Python backend you can explain in the lab'}</h2>
            <p>
              {isHi
                ? 'React इंटरफेस FastAPI endpoints से बात करता है। Python backend अनुरोधों की जांच करता है, डेमो या Gemini जवाब चुनता है और SQLAlchemy के माध्यम से रिकॉर्ड सेव करता है।'
                : 'The React interface calls FastAPI endpoints. Python validates requests, checks emergency keywords before AI, selects demo or Gemini responses, and stores records through SQLAlchemy.'}
            </p>
            <button className="project-link" onClick={() => onNavigate('chat')}>
              {isHi ? 'काम करने वाला डेमो देखें' : 'See the app in action'} <ArrowRight size={16} />
            </button>
          </div>
          <div className="architecture-list">
            <div className="architecture-step">
              <span className="architecture-icon"><BookOpenText size={18} /></span>
              <div><strong>React + Vite</strong><span>{isHi ? 'यूज़र इंटरफेस' : 'The user interface'}</span></div>
              <span className="step-index">01</span>
            </div>
            <div className="architecture-connector" />
            <div className="architecture-step">
              <span className="architecture-icon"><Server size={18} /></span>
              <div><strong>Python + FastAPI</strong><span>{isHi ? 'REST API और सुरक्षा नियम' : 'REST API and safety rules'}</span></div>
              <span className="step-index">02</span>
            </div>
            <div className="architecture-connector" />
            <div className="architecture-step">
              <span className="architecture-icon"><Database size={18} /></span>
              <div><strong>SQLAlchemy + SQLite</strong><span>{isHi ? 'स्थानीय विकास डेटाबेस' : 'Local development database'}</span></div>
              <span className="step-index">03</span>
            </div>
            <p className="architecture-note">{isHi ? 'Gemini API वैकल्पिक है; डेमो मोड में ऐप बिना API key चलता है।' : 'Gemini is optional. Demo mode works without an API key.'}</p>
          </div>
        </div>
      </section>

      <section className="privacy-note page-container">
        <div className="privacy-icon"><ShieldAlert size={20} /></div>
        <div>
          <strong>{isHi ? 'केवल शैक्षिक उपयोग के लिए' : 'A learning project, not a medical service'}</strong>
          <p>{isHi
            ? 'यह ऐप निदान या उपचार नहीं करता। इसमें login नहीं है; इस deployment के सभी उपयोगकर्ता backend history साझा करते हैं और उसे मिटा सकते हैं। व्यक्तिगत या संवेदनशील स्वास्थ्य जानकारी न डालें।'
            : 'This app does not diagnose or treat. There are no user accounts; everyone using this deployment shares the backend history and can delete it. Do not enter real names or sensitive health information.'}</p>
        </div>
      </section>
    </div>
  );
}
