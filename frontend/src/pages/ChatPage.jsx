import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  PhoneCall,
  Loader2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import StructuredResponseCard from '../components/StructuredResponseCard';
import DemoQuestions from '../components/DemoQuestions';
import EmergencyCallLink from '../components/EmergencyCallLink';

export default function ChatPage({ onOpenEmergency }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async (search = '') => {
    try {
      const data = await api.getConversations(search);
      setConversations(data || []);
      setErrorMsg(null);
      if (!activeConvId && data && data.length > 0) {
        selectConversation(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setErrorMsg(err.message || (isHi ? 'बातचीत लोड नहीं हो सकी। API कनेक्शन जांचें।' : 'Could not load conversations. Check the API connection.'));
    }
  };

  const selectConversation = async (id) => {
    setActiveConvId(id);
    setSidebarOpen(false);
    setErrorMsg(null);
    try {
      const data = await api.getConversationDetail(id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setInputValue('');
    setErrorMsg(null);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm(isHi
      ? 'इस deployment के सभी उपयोगकर्ताओं की साझा बातचीत मिट जाएगी। क्या आप जारी रखना चाहते हैं?'
      : 'This deletes the shared conversation history for every user of this deployment. Continue?')) {
      try {
        await api.clearAllConversations();
        setConversations([]);
        handleNewConversation();
      } catch (err) {
        console.error('Failed to clear conversations:', err);
      }
    }
  };

  const handleSend = async (messageToSend = null) => {
    const text = messageToSend || inputValue;
    if (!text || !text.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessageText = text.trim();
    setInputValue('');

    // Optimistic UI for user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      content: userMessageText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(userMessageText, activeConvId, language);
      
      const asstMsg = {
        id: response.message_id,
        sender: 'assistant',
        content: response.reply,
        structured_data: response.structured_data,
        is_emergency: response.is_emergency,
        emergency_alert: response.emergency_alert,
        mode: response.mode,
        created_at: response.created_at
      };

      setMessages((prev) => [...prev, asstMsg]);

      // If new conversation, set active ID and refresh list
      if (!activeConvId || activeConvId !== response.conversation_id) {
        setActiveConvId(response.conversation_id);
        loadConversations();
      }

      // If emergency detected by backend, trigger modal too
      if (response.is_emergency) {
        onOpenEmergency(response.emergency_alert);
      }

    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Unable to connect to MediMind health service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex gap-6">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-xs" 
        />
      )}

      {/* Left Sidebar: Conversations History */}
      <aside className={`
        fixed md:static top-20 bottom-4 left-4 z-40 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isHi ? 'परामर्श इतिहास' : 'Consultations'}
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full py-2.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newChat')}</span>
          </button>
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadConversations(e.target.value);
              }}
              placeholder={t('searchChats')}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {isHi ? 'कोई पूर्व बातचीत नहीं मिली।' : 'No saved conversations yet.'}
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConvId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                    isActive
                      ? 'bg-teal-50/80 text-teal-900 font-semibold border border-teal-200/60'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="truncate">{c.title || 'Consultation'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition rounded"
                    title={t('delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleClearAll}
              className="w-full text-center text-[11px] text-slate-500 hover:text-red-600 transition font-medium flex items-center justify-center gap-1.5 py-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t('clearHistory')}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden relative">
        {/* Chat Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 text-slate-600 hover:text-slate-900 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                MediMind AI Health Assistant
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>{isHi ? 'शैक्षिक मार्गदर्शन (गैर-निदान)' : 'Educational Guidance (Non-Diagnostic)'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenEmergency(null)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>112</span>
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State Hero with Demo Prompts */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {isHi ? 'मैं आपकी स्वास्थ्य संबंधी क्या सहायता कर सकता हूँ?' : 'How can I assist with your health today?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isHi
                    ? 'अपने लक्षणों का वर्णन करें। आपको संभावित कारणों, प्राथमिक राहत उपायों और डॉक्टर से मिलने के समय पर संरचित उत्तर मिलेगा।'
                    : 'Describe your symptoms in everyday language. You will receive structured cards explaining possible considerations, comfort measures, and when to seek medical evaluation.'}
                </p>
              </div>

              {/* Sample Demo Questions */}
              <div className="w-full text-left pt-2">
                <DemoQuestions onSelectQuestion={(q) => handleSend(q)} />
              </div>
            </div>
          ) : (
            /* Render Message History */
            messages.map((m) => {
              const isUser = m.sender === 'user';
              const isEmergency = m.is_emergency;

              if (isUser) {
                return (
                  <div key={m.id} className="flex justify-end animate-fade-in">
                    <div className="max-w-[85%] sm:max-w-[70%] bg-teal-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-2xs text-sm leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                );
              }

              // Assistant message
              return (
                <div key={m.id} className="flex items-start space-x-3 animate-fade-in">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs mt-1 ${
                    isEmergency ? 'bg-red-600 text-white' : 'bg-teal-700 text-white'
                  }`}>
                    {isEmergency ? <ShieldAlert className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 max-w-[95%] sm:max-w-[85%] rounded-2xl rounded-tl-xs p-4 sm:p-5 border shadow-2xs ${
                    isEmergency 
                      ? 'bg-red-50/70 border-red-300' 
                      : 'bg-white border-slate-200/90'
                  }`}>
                    {isEmergency ? (
                      /* High-Visibility Emergency Interception Card */
                      <div className="space-y-4">
                        <div className="p-3 bg-red-600 text-white rounded-xl flex items-center gap-2.5 font-bold text-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>{isHi ? '🚨 तत्काल आपातकालीन चेतावनी!' : '🚨 CRITICAL MEDICAL EMERGENCY DETECTED'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-red-900 leading-relaxed font-medium whitespace-pre-line">
                          {m.content}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <EmergencyCallLink
                            number="112"
                            desktopMessage={isHi ? 'इस डिवाइस पर डायल पैड उपलब्ध नहीं है। फोन से इस नंबर पर कॉल करें।' : 'A dial pad is unavailable here. Use a phone to call this number.'}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{isHi ? '112 पर कॉल करें' : 'Call 112 (India emergency)'}</span>
                          </EmergencyCallLink>
                          <EmergencyCallLink
                            number="108"
                            desktopMessage={isHi ? 'इस डिवाइस पर डायल पैड उपलब्ध नहीं है। फोन से इस नंबर पर कॉल करें।' : 'A dial pad is unavailable here. Use a phone to call this number.'}
                            className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{isHi ? '108 एम्बुलेंस' : 'Call 108 (ambulance)'}</span>
                          </EmergencyCallLink>
                          <EmergencyCallLink
                            number="102"
                            desktopMessage={isHi ? 'इस डिवाइस पर डायल पैड उपलब्ध नहीं है। फोन से इस नंबर पर कॉल करें।' : 'A dial pad is unavailable here. Use a phone to call this number.'}
                            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{isHi ? '102 मरीज परिवहन' : 'Call 102 (patient transport)'}</span>
                          </EmergencyCallLink>
                        </div>
                      </div>
                    ) : (
                      /* Regular 4-Card Structured Response */
                      <StructuredResponseCard
                        structuredData={m.structured_data}
                        replyText={m.content}
                        timestamp={m.created_at}
                        isEmergency={false}
                        mode={m.mode}
                        onFollowUpClick={(q) => handleSend(q)}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center space-x-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>{isHi ? 'शैक्षिक जवाब तैयार हो रहा है...' : 'Preparing an educational response...'}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatPlaceholder')}
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg transition transform active:scale-95 disabled:scale-100"
              aria-label={t('send')}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Micro disclaimer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>{isHi ? '⚠️ केवल शैक्षिक मार्गदर्शन। आपातकाल में तुरंत 112 डायल करें।' : '⚠️ Educational tool. For emergencies, call 112 in India or your local emergency number immediately.'}</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </main>
    </div>
  );
}



