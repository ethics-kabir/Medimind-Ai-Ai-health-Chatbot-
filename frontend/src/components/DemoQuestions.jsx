import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DemoQuestions({ onSelectQuestion }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const questions = isHi ? [
    { text: "मुझे कल से हल्का बुखार और सिरदर्द है।", type: "routine" },
    { text: "मुझे तीन दिन से खांसी आ रही है।", type: "routine" },
    { text: "मुझे हर समय बहुत थकान महसूस होती है।", type: "routine" },
    { text: "शरीर में पानी की कमी (डिहाइड्रेशन) के मुख्य लक्षण क्या हैं?", type: "routine" },
    { text: "मेरे सीने में दर्द हो रहा है और मुझे सांस लेने में तकलीफ है।", type: "emergency" },
  ] : [
    { text: "I have a mild fever and headache since yesterday.", type: "routine" },
    { text: "I have been coughing for three days.", type: "routine" },
    { text: "I feel tired all the time.", type: "routine" },
    { text: "What are common symptoms of dehydration?", type: "routine" },
    { text: "My chest hurts and I am having difficulty breathing.", type: "emergency" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
        <span>{t('demoPromptsTitle')}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const isEmergency = q.type === 'emergency';
          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(q.text)}
              className={`text-xs px-3 py-1.5 rounded-full border transition font-medium text-left flex items-center space-x-1.5 shadow-2xs hover:scale-[1.02] active:scale-95 ${
                isEmergency
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900'
              }`}
            >
              {isEmergency && <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />}
              <span>{q.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
