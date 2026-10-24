import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Pill,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, apiStatus, onOpenEmergency }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: t('navHome'), icon: HeartPulse },
    { id: 'chat', label: t('navChat'), icon: MessageCircle },
    { id: 'symptom-checker', label: t('navSymptomChecker'), icon: Activity },
    { id: 'medications', label: t('navMedications'), icon: Pill },
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
  ];
  const statusText = {
    loading: language === 'hi' ? 'कनेक्ट हो रहा है' : 'Connecting to API',
    demo: language === 'hi' ? 'डेमो मोड' : 'Demo mode',
    live: language === 'hi' ? 'AI सक्रिय' : 'AI connected',
    offline: language === 'hi' ? 'API ऑफ़लाइन' : 'API offline',
  }[apiStatus] || 'API offline';

  const navigate = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner page-container">
        <button className="brand" onClick={() => navigate('landing')} aria-label="MediMind home">
          <span className="brand-mark"><HeartPulse size={22} strokeWidth={2} /></span>
          <span className="brand-text">
            <strong>MediMind<span>AI</span></strong>
            <small>{language === 'hi' ? 'AI APPLICATIONS LAB' : 'AI APPLICATIONS LAB'}</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link${activeTab === id ? ' is-active' : ''}`}
              onClick={() => navigate(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={16} /> <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <span className={`api-status status-${apiStatus || 'offline'}`} title={statusText}>
            <span className="status-dot" />
            <span>{statusText}</span>
          </span>
          <button className="language-button" onClick={toggleLanguage} aria-label="Change language">
            {language === 'en' ? 'हि' : 'EN'}
          </button>
          <button className="emergency-button" onClick={onOpenEmergency}>
            <ShieldAlert size={16} />
            <span>{language === 'hi' ? 'आपातकाल' : 'Emergency'}</span>
          </button>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`mobile-nav-link${activeTab === id ? ' is-active' : ''}`}
              onClick={() => navigate(id)}
            >
              <Icon size={18} /> <span>{label}</span>
            </button>
          ))}
          <div className="mobile-nav-foot"><span className="status-dot" />{statusText}</div>
        </nav>
      )}
    </header>
  );
}
