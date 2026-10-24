import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  PhoneCall, 
  Sparkles,
  Heart,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function SymptomCheckerPage({ onOpenEmergency }) {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Form State
  const [mainSymptom, setMainSymptom] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState(4);
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [selectedAssociated, setSelectedAssociated] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');

  // Quick symptom chips
  const quickSymptoms = isHi ? [
    'सिरदर्द', 'हल्का बुखार', 'खांसी', 'गले में खराश', 
    'थकान', 'पेट दर्द', 'मतली', 'जोड़ों में दर्द'
  ] : [
    'Headache', 'Mild Fever', 'Coughing', 'Sore Throat',
    'Fatigue', 'Abdominal Pain', 'Nausea', 'Joint Pain'
  ];

  const commonAssociated = isHi ? [
    'बुखार', 'ठंड लगना', 'मतली', 'उल्टी', 'दस्त', 
    'चक्कर आना', 'भूख न लगना', 'कमजोरी', 'शरीर में दर्द'
  ] : [
    'Fever', 'Chills', 'Nausea', 'Vomiting', 'Diarrhea',
    'Dizziness', 'Loss of appetite', 'Fatigue / Weakness', 'Body aches'
  ];

  const commonConditions = isHi ? [
    'अस्थमा', 'मधुमेह (Diabetes)', 'उच्च रक्तचाप (Hypertension)', 
    'हृदय रोग', 'थायरॉयड', 'कोई नहीं'
  ] : [
    'Asthma', 'Diabetes', 'Hypertension (High BP)',
    'Heart Condition', 'Thyroid Disorder', 'None'
  ];

  const toggleAssociated = (s) => {
    setSelectedAssociated((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleCondition = (c) => {
    if (c === 'None' || c === 'कोई नहीं') {
      setSelectedConditions([c]);
      return;
    }
    setSelectedConditions((prev) => {
      const filtered = prev.filter((item) => item !== 'None' && item !== 'कोई नहीं');
      return filtered.includes(c) ? filtered.filter((item) => item !== c) : [...filtered, c];
    });
  };

  const handleNextStep = () => {
    if (step === 1 && !mainSymptom.trim()) {
      setError(isHi ? 'कृपया अपना मुख्य लक्षण दर्ज करें।' : 'Please specify your primary symptom.');
      return;
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!mainSymptom.trim()) {
      setError(isHi ? 'कृपया अपना मुख्य लक्षण दर्ज करें।' : 'Please specify your primary symptom.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      main_symptom: mainSymptom.trim(),
      duration,
      severity: Number(severity),
      age_group: ageGroup,
      associated_symptoms: selectedAssociated,
      existing_conditions: selectedConditions,
      current_medications: medications || 'None reported',
      allergies: allergies || 'None reported',
      language
    };

    try {
      const data = await api.submitSymptomCheck(payload);
      setResult(data);
      if (data.is_emergency) {
        onOpenEmergency(data.emergency_alert);
      }
    } catch (err) {
      console.error('Symptom check submission error:', err);
      setError(err.message || 'Failed to complete clinical evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep(1);
    setMainSymptom('');
    setDuration('1-2 days');
    setSeverity(4);
    setAgeGroup('Adult');
    setSelectedAssociated([]);
    setSelectedConditions([]);
    setMedications('');
    setAllergies('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-cyan-600" />
          <span>{isHi ? 'शैक्षिक लक्षण मूल्यांकन' : 'Educational Triage Assessment'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('symptomCheckerTitle')}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t('symptomCheckerSubtitle')}
        </p>
      </div>

      {/* Step Indicators */}
      {!result && (
        <div className="flex items-center justify-between max-w-xl mx-auto relative px-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center relative z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step === s
                  ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-md'
                  : step > s
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 font-medium hidden sm:block">
                {s === 1 && (isHi ? 'लक्षण' : 'Symptom')}
                {s === 2 && (isHi ? 'गंभीरता' : 'Severity')}
                {s === 3 && (isHi ? 'इतिहास' : 'History')}
                {s === 4 && (isHi ? 'दवाएं' : 'Meds')}
              </span>
            </div>
          ))}
          {/* Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CARD */}
      {!result ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* STEP 1: Main Symptom & Duration */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {isHi ? '1. आपका मुख्य लक्षण क्या है?' : '1. What is your primary symptom?'}
                </label>
                <input
                  type="text"
                  value={mainSymptom}
                  onChange={(e) => setMainSymptom(e.target.value)}
                  placeholder={isHi ? 'उदा. हल्का सिरदर्द, सूखी खांसी, थकान...' : 'e.g. Mild headache, dry cough, dizziness...'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div>
                <span className="text-xs text-slate-500 block mb-2 font-medium">
                  {isHi ? 'या नीचे दिए गए सामान्य लक्षणों में से चुनें:' : 'Or tap a common suggestion:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickSymptoms.map((qs, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setMainSymptom(qs)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        mainSymptom === qs
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {qs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {isHi ? 'यह लक्षण कितने समय से है?' : 'How long have you noticed this symptom?'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['< 24 hours', '1-2 days', '3-7 days', '> 1 week'].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                        duration === d
                          ? 'bg-teal-50 text-teal-800 border-teal-500 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Severity & Age */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Severity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-900">
                    {isHi ? '2. गंभीरता का स्तर (1 से 10):' : '2. Discomfort / Severity Scale (1 - 10):'}
                  </label>
                  <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-md ${
                    severity <= 3 ? 'bg-emerald-100 text-emerald-800' :
                    severity <= 6 ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {severity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1.5">
                  <span>{isHi ? '1: बहुत हल्का' : '1: Mild'}</span>
                  <span>{isHi ? '5: मध्यम' : '5: Moderate'}</span>
                  <span>{isHi ? '10: अत्यंत तीव्र' : '10: Severe'}</span>
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {isHi ? 'आयु वर्ग:' : 'Patient Age Demographics:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'Infant', label: isHi ? 'शिशु (< 1 वर्ष)' : 'Infant (<1 yr)' },
                    { id: 'Child', label: isHi ? 'बच्चा (1-12 वर्ष)' : 'Child (1-12)' },
                    { id: 'Teen', label: isHi ? 'किशोर (13-17 वर्ष)' : 'Teen (13-17)' },
                    { id: 'Adult', label: isHi ? 'वयस्क (18-64 वर्ष)' : 'Adult (18-64)' },
                    { id: 'Senior', label: isHi ? 'वरिष्ठ (65+ वर्ष)' : 'Senior (65+)' },
                  ].map((ag) => (
                    <button
                      type="button"
                      key={ag.id}
                      onClick={() => setAgeGroup(ag.id)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition text-center ${
                        ageGroup === ag.id
                          ? 'bg-teal-50 text-teal-800 border-teal-500 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Associated Symptoms & Conditions */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {isHi ? '3. क्या इसके साथ कोई अन्य लक्षण भी हैं?' : '3. Any associated symptoms? (Select all that apply)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonAssociated.map((asymp, i) => {
                    const isSelected = selectedAssociated.includes(asymp);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleAssociated(asymp)}
                        className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {asymp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {isHi ? 'पूर्व-मौजूदा स्वास्थ्य स्थितियां:' : 'Pre-existing medical conditions:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonConditions.map((cond, i) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleCondition(cond)}
                        className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Medications & Allergies */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  {isHi ? '4. क्या आप वर्तमान में कोई नियमित दवाएं ले रहे हैं?' : '4. Current medications (if any):'}
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  {isHi ? 'दवा का नाम लिखें या खाली छोड़ दें।' : 'List prescribed or over-the-counter drugs, or leave blank.'}
                </p>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Atorvastatin, Inhaler..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  {isHi ? 'ज्ञात एलर्जी (यदि कोई हो):' : 'Known drug or environmental allergies:'}
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs, None..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  {isHi
                    ? 'यह शैक्षिक डेमो है। जवाब देने के लिए जानकारी backend पर सेव हो सकती है और deployment के अन्य उपयोगकर्ताओं को दिख सकती है। नाम या निजी स्वास्थ्य जानकारी न लिखें।'
                    : 'This is an educational demo. Your answers may be saved on the backend and visible to other users of this deployment. Do not enter names or sensitive health information.'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('back')}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? t('analyzing') : t('submitAssessment')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* RESULTS VIEW */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* Top Triage Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {isHi ? 'मूल्यांकन परिणाम' : 'Triage Assessment Result'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                  result.risk_level.includes('High') || result.risk_level.includes('Emergency') || result.risk_level.includes('उच्च')
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : result.risk_level.includes('Moderate') || result.risk_level.includes('मध्यम')
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  Risk Level: {result.risk_level}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {mainSymptom}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Duration: {duration} • Severity: {severity}/10 • Age: {ageGroup}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Print Summary"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isHi ? 'नई जांच' : 'New Check'}</span>
              </button>
            </div>
          </div>

          {/* Recommended Next Step Callout */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              {isHi ? 'अनुशंसित अगला कदम (Recommended Next Step):' : 'Recommended Next Step:'}
            </h3>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {result.recommended_action}
            </p>
          </div>

          {/* 3 Grid Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Panel 1: Possible Explanations */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isHi ? 'संभावित विचार' : 'Potential Considerations'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.possible_explanations.map((exp, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-teal-500 mr-2 font-bold">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel 2: Self-Care Steps */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHi ? 'घर पर प्राथमिक उपाय' : 'Self-Care Steps'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.self_care_steps.map((sc, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-emerald-500 mr-2 font-bold">•</span>
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel 3: Red Flags to Monitor */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHi ? 'खतरे के संकेत' : 'Red-Flag Symptoms'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-900">
                {result.red_flag_symptoms.map((rf, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-rose-500 mr-2 font-bold">•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeframe callout */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
            <div>
              <span className="font-bold block">{isHi ? 'डॉक्टर से मिलने की अनुशंसित समयसीमा:' : 'Evaluation Timeframe:'}</span>
              <span>{result.evaluation_timeframe}</span>
            </div>
            <button
              onClick={() => onOpenEmergency(null)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
            >
              <PhoneCall className="w-3 h-3" />
              <span>112</span>
            </button>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{result.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}

