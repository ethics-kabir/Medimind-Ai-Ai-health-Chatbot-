import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyModal from './components/EmergencyModal';

import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import MedicationsPage from './pages/MedicationsPage';
import HistoryDashboardPage from './pages/HistoryDashboardPage';

function MainApp() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [emergencyAlertData, setEmergencyAlertData] = useState(null);
  const [apiStatus, setApiStatus] = useState('loading');

  useEffect(() => {
    // Check backend health and AI mode
    api.getHealth()
      .then((health) => {
        setApiStatus(health.mode === 'demo' ? 'demo' : 'live');
      })
      .catch((err) => {
        console.warn('Backend health check note:', err);
        setApiStatus('offline');
      });
  }, []);

  const handleOpenEmergency = (alertData = null) => {
    setEmergencyAlertData(alertData);
    setIsEmergencyOpen(true);
  };

  const handleCloseEmergency = () => {
    setIsEmergencyOpen(false);
    setEmergencyAlertData(null);
  };

  return (
    <div className="app-shell min-h-screen flex flex-col text-slate-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
        onOpenEmergency={() => handleOpenEmergency(null)}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={setActiveTab}
            onOpenEmergency={() => handleOpenEmergency(null)}
            apiStatus={apiStatus}
          />
        )}
        {activeTab === 'chat' && (
          <ChatPage
            onOpenEmergency={handleOpenEmergency}
          />
        )}
        {activeTab === 'symptom-checker' && (
          <SymptomCheckerPage
            onOpenEmergency={handleOpenEmergency}
          />
        )}
        {activeTab === 'medications' && (
          <MedicationsPage />
        )}
        {activeTab === 'dashboard' && (
          <HistoryDashboardPage
            onNavigate={setActiveTab}
            onOpenEmergency={() => handleOpenEmergency(null)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Critical Emergency Interception Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={handleCloseEmergency}
        alertData={emergencyAlertData}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
