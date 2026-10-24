import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  Search, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function HistoryDashboardPage({ onNavigate, onOpenEmergency }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [conversations, setConversations] = useState([]);
  const [symptomChecks, setSymptomChecks] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [convs, checks, tips] = await Promise.all([
        api.getConversations(),
        api.getSymptomChecks(),
        api.getHealthTips(),
      ]);
      setConversations(convs || []);
      setSymptomChecks(checks || []);
      setHealthTips(tips || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const handleDeleteSymptomCheck = async (id) => {
    try {
      await api.deleteSymptomCheck(id);
      setSymptomChecks((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete symptom check error:', err);
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm(isHi
      ? 'इस deployment के सभी उपयोगकर्ताओं की साझा चैट और लक्षण इतिहास मिट जाएगी। क्या आप जारी रखना चाहते हैं?'
      : 'This deletes shared chat and symptom history for every user of this deployment. Continue?')) {
      try {
        await Promise.all([
          api.clearAllConversations(),
          api.clearAllSymptomChecks(),
        ]);
        setConversations([]);
        setSymptomChecks([]);
      } catch (err) {
        console.error('Clear history error:', err);
      }
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSymptomChecks = symptomChecks.filter((s) =>
    s.main_symptom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
            <span>{isHi ? 'साझा गतिविधि इतिहास' : 'Shared Activity History'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('dashboardSubtitle')}
          </p>
        </div>

        {/* Clear All History Button */}
        {(conversations.length > 0 || symptomChecks.length > 0) && (
          <button
            onClick={handleClearAllHistory}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-2 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>{t('clearHistory')}</span>
          </button>
        )}
      </div>

      {/* Quick Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {isHi ? 'कुल परामर्श' : 'Total Consultations'}
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {conversations.length}
          </div>
          <button
            onClick={() => onNavigate('chat')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 pt-1"
          >
            <span>{isHi ? 'नया परामर्श शुरू करें' : 'Start consultation'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {isHi ? 'लक्षण जांच रिकॉर्ड' : 'Symptom Assessments'}
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {symptomChecks.length}
          </div>
          <button
            onClick={() => onNavigate('symptom-checker')}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 pt-1"
          >
            <span>{isHi ? 'लक्षण जांचें' : 'Check symptoms'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {isHi ? 'सुरक्षा स्थिति' : 'Safety Engine'}
          </span>
          <div className="text-base font-bold text-teal-800 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Pre-LLM Active</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {isHi ? 'रेड-फ्लैग मॉनिटरिंग सक्षम' : 'Deterministic Red-Flag Filter'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {isHi ? 'आपातकालीन नंबर' : 'Emergency Hotlines'}
          </span>
          <div className="text-sm font-extrabold text-red-600 mt-1">
            112 / 108 / 102
          </div>
          <button
            onClick={() => onOpenEmergency(null)}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 pt-1"
          >
            <span>{isHi ? 'त्वरित आपातकालीन सहायता' : 'Emergency directory'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search Input for History */}
      {(conversations.length > 0 || symptomChecks.length > 0) && (
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'इतिहास में खोजें...' : 'Search past records...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>
      )}

      {/* Main Split: Past Consultations & Symptom Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Panel 1: Recent Consultations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>{t('recentConversations')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredConversations.length} records
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                {t('noHistory')}
              </div>
            ) : (
              filteredConversations.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-teal-50/50 hover:border-teal-200 transition group text-xs"
                >
                  <div 
                    onClick={() => onNavigate('chat')}
                    className="flex-1 cursor-pointer pr-3"
                  >
                    <h4 className="font-semibold text-slate-900 group-hover:text-teal-900 truncate">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{c.message_count} messages</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteConversation(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition rounded"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Recent Symptom Checks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>{t('recentSymptomChecks')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredSymptomChecks.length} records
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredSymptomChecks.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                {t('noHistory')}
              </div>
            ) : (
              filteredSymptomChecks.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-cyan-50/50 hover:border-cyan-200 transition group text-xs"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {s.main_symptom}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.risk_level.includes('High') || s.risk_level.includes('Emergency') || s.risk_level.includes('उच्च')
                          ? 'bg-red-100 text-red-800'
                          : s.risk_level.includes('Moderate') || s.risk_level.includes('मध्यम')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.risk_level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {s.duration} • Severity {s.severity}/10 • {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSymptomCheck(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition rounded"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Daily Rotating Health & Wellness Tips */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{t('dailyTips')}</span>
          </div>
          <span className="text-xs text-slate-400">General information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {healthTips.slice(0, 3).map((tip) => (
            <div key={tip.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                {tip.category}
              </span>
              <h4 className="text-sm font-bold text-white">{tip.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.content}</p>
              <div className="text-[11px] text-teal-200/90 pt-1 font-medium">
                💡 <em>{tip.action_item}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


