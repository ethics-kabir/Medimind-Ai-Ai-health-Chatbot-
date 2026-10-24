import React from 'react';
import { AlertTriangle, PhoneCall, Hospital, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import EmergencyCallLink from './EmergencyCallLink';

export default function EmergencyModal({ isOpen, onClose, alertData }) {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const isHi = language === 'hi';
  const desktopMessage = isHi
    ? 'इस डिवाइस पर डायल पैड उपलब्ध नहीं है। फोन से इस नंबर पर कॉल करें।'
    : 'A dial pad is unavailable here. Use a phone to call this number.';

  const defaultActions = isHi ? [
    'तुरंत 112 या स्थानीय आपातकालीन सेवा को कॉल करें।',
    'शांत रहें और मरीज को सुरक्षित स्थिति में रखें।',
    'खुद वाहन चलाकर अस्पताल न जाएं, एम्बुलेंस की प्रतीक्षा करें।',
    'यदि छाती में दर्द है तो आराम से बैठें और कपड़े ढीले करें।'
  ] : [
    'Call 112 or your local emergency service immediately.',
    'Remain as calm as possible and sit or lie in a comfortable position.',
    'Do NOT attempt to drive yourself to the emergency department.',
    'If experiencing chest pain or stroke signs, note the exact time symptoms began.'
  ];

  const actions = alertData?.immediate_actions || defaultActions;
  const headline = alertData?.headline || (isHi ? 'गंभीर आपातकालीन चिकित्सा चेतावनी' : 'CRITICAL MEDICAL EMERGENCY WARNING');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide uppercase">{t('emergencyModalTitle')}</h2>
              <p className="text-xs text-red-100">
                {isHi ? 'तत्काल आपातकालीन सहायता की आवश्यकता है' : 'Immediate Emergency Care Required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="text-base font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              {headline}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {isHi
                ? 'हमारे सुरक्षा फिल्टर ने ऐसे लक्षणों की पहचान की है जिन्हें अनदेखा नहीं किया जा सकता। कृपया ऑनलाइन सलाह के भरोसे न रहें।'
                : 'Our safety protocol detected signs of an acute condition that cannot be managed with online advice. In-person emergency triage is critical.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isHi ? 'तुरंत क्या करें (Immediate Steps):' : 'Immediate Action Checklist:'}
            </h4>
            <ul className="space-y-2">
              {actions.map((act, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-800 font-medium">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold mr-2.5 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <EmergencyCallLink
              number="112"
              desktopMessage={desktopMessage}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{isHi ? '112 पर कॉल करें (आपातकाल)' : 'Call 112 (India emergency)'}</span>
            </EmergencyCallLink>
            <EmergencyCallLink
              number="108"
              desktopMessage={desktopMessage}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-xl shadow transition transform active:scale-95"
            >
              <Hospital className="w-5 h-5 text-rose-100" />
              <span>{isHi ? '108 एम्बुलेंस (जहाँ उपलब्ध)' : 'Call 108 (ambulance, where available)'}</span>
            </EmergencyCallLink>
            <EmergencyCallLink
              number="102"
              desktopMessage={desktopMessage}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow transition transform active:scale-95"
            >
              <Hospital className="w-5 h-5 text-teal-400" />
              <span>{isHi ? '102 मरीज परिवहन (जहाँ उपलब्ध)' : 'Call 102 (patient transport, where available)'}</span>
            </EmergencyCallLink>
          </div>
          <p className="text-xs text-slate-500">
            {isHi
              ? '112 भारत का एकीकृत आपातकालीन नंबर है। 108/102 की उपलब्धता राज्य के अनुसार अलग हो सकती है।'
              : 'In India, 112 is the unified emergency number. Ambulance services 108 and 102 vary by state.'}
          </p>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {isHi
                ? 'मानसिक स्वास्थ्य या संकट के समय: टेली-मानस 14416 (24x7) पर संपर्क करें।'
                : 'Mental health crisis or distress? Call Tele-MANAS 14416 (India) anytime.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            {isHi ? 'चेतावनी समझी (बंद करें)' : 'I Understand (Close Warning)'}
          </button>
        </div>
      </div>
    </div>
  );
}

