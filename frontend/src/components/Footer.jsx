import React from 'react';
import { HeartPulse, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onNavigate }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <footer className="site-footer">
      <div className="footer-inner page-container">
        <div className="footer-brand">
          <span className="footer-mark"><HeartPulse size={19} /></span>
          <div><strong>MediMind AI</strong><span>{isHi ? 'AI Applications Lab · Python' : 'AI Applications Lab · Python'}</span></div>
        </div>
        <p className="footer-disclaimer">
          <ShieldAlert size={15} />
          {isHi
            ? 'केवल शैक्षिक परियोजना। यह निदान या उपचार का विकल्प नहीं है। आपातकाल में 112 या स्थानीय आपातकालीन सेवा को कॉल करें।'
            : 'Educational project only. Not a diagnosis or treatment service. In an emergency, call 112 in India or your local emergency number.'}
        </p>
        <div className="footer-links">
          <button onClick={() => onNavigate('chat')}>{isHi ? 'चैट' : 'Chat'}</button>
          <button onClick={() => onNavigate('symptom-checker')}>{isHi ? 'लक्षण जांच' : 'Symptom check'}</button>
          <button onClick={() => onNavigate('medications')}>{isHi ? 'दवाएं' : 'Medicines'}</button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MediMind AI</span>
          <span>{isHi ? 'बनाया गया शैक्षिक प्रदर्शन के लिए' : 'Built for a classroom demonstration'}</span>
        </div>
      </div>
    </footer>
  );
}
