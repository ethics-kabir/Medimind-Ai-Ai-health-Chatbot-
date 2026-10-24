import React, { useState } from 'react';
import { 
  Stethoscope, 
  Lightbulb, 
  AlertTriangle, 
  UserCheck, 
  HelpCircle, 
  Copy, 
  Check, 
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StructuredResponseCard({ 
  structuredData, 
  replyText, 
  timestamp, 
  isEmergency, 
  mode,
  onFollowUpClick 
}) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isHi = language === 'hi';

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (!structuredData) {
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-line text-sm text-slate-800 leading-relaxed">
          {replyText}
        </p>
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>{formattedTime}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-slate-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    summary,
    possible_causes = [],
    what_to_do = [],
    things_to_watch = [],
    when_to_see_doctor = [],
    clarifying_questions = [],
    disclaimer
  } = structuredData;

  return (
    <div className="space-y-4 text-slate-800 animate-fade-in">
      {/* Overview Summary */}
      {summary && (
        <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-sm leading-relaxed font-medium text-teal-950">
          {summary}
        </div>
      )}

      {/* 4 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Possible Causes */}
        {possible_causes.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-teal-200 transition">
            <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2.5">
              <div className="p-1.5 bg-teal-50 rounded-lg">
                <Stethoscope className="w-4 h-4 text-teal-600" />
              </div>
              <span>{isHi ? '🩺 संभावित कारण (Possible Causes)' : '🩺 Possible Considerations'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {possible_causes.map((c, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-teal-500 mr-2 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2. What you can do */}
        {what_to_do.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2.5">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
              </div>
              <span>{isHi ? '💡 आप क्या कर सकते हैं (Self-Care)' : '💡 What You Can Do Right Now'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {what_to_do.map((w, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-emerald-500 mr-2 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Things to watch for */}
        {things_to_watch.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-amber-200 transition">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2.5">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span>{isHi ? '⚠️ ध्यान देने योग्य बातें (Warning Signs)' : '⚠️ Things To Watch For'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {things_to_watch.map((t, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-amber-500 mr-2 font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. When to see a doctor */}
        {when_to_see_doctor.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-sky-200 transition">
            <div className="flex items-center space-x-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-2.5">
              <div className="p-1.5 bg-sky-50 rounded-lg">
                <UserCheck className="w-4 h-4 text-sky-600" />
              </div>
              <span>{isHi ? '👨‍⚕️ डॉक्टर से कब मिलें (Medical Care)' : '👨‍⚕️ When To See A Doctor'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {when_to_see_doctor.map((d, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-sky-500 mr-2 font-bold">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Clarifying Follow-Up Questions */}
      {clarifying_questions.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{isHi ? 'स्थिति को स्पष्ट करने वाले प्रश्न:' : 'Clarifying questions that can help narrow this down:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {clarifying_questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick && onFollowUpClick(q)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer & Footer Controls */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>{disclaimer || (isHi ? 'शैक्षिक जानकारी, निदान नहीं।' : 'Educational health guidance, not a diagnosis.')}</span>
        </div>
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {mode && (
            <span className="inline-flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              {mode === 'gemini' ? 'Gemini 2.5' : 'Demo AI'}
            </span>
          )}
          {formattedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition font-medium"
            title="Copy text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'कॉपी' : 'Copy')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
