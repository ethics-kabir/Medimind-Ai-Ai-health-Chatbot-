import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertOctagon, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function MedicationsPage() {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [medications, setMedications] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async (q = '') => {
    setLoading(true);
    try {
      const data = await api.getMedications(q);
      setMedications(data || []);
      if (data && data.length > 0 && !selectedMed) {
        setSelectedMed(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchMeds(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Pill className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHi ? 'शैक्षिक दवा जानकारी' : 'Educational medicine reference'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('medicationsTitle')}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('medicationsSubtitle')}
        </p>
      </div>

      {/* Prominent Educational Warning */}
      <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
          <strong>{isHi ? 'महत्वपूर्ण चेतावनी: ' : 'Critical Advisory: '}</strong>
          {t('medicationDisclaimer')}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-xl mx-auto relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('searchMedicationPlaceholder')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
      </div>

      {/* Main Content Layout: List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Medication Cards List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {medications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              {isHi ? 'कोई दवा नहीं मिली।' : 'No matching medications found.'}
            </div>
          ) : (
            medications.map((m) => {
              const isSelected = selectedMed?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMed(m)}
                  className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-semibold ring-1 ring-teal-500'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                      <p className="text-xs text-slate-500">{m.generic_name}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {m.drug_class.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Monograph View */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {selectedMed ? (
            <div className="space-y-6 animate-fade-in">
              {/* Monograph Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    {selectedMed.drug_class}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedMed.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Generic Compound: <span className="font-semibold text-slate-700">{selectedMed.generic_name}</span>
                </p>
              </div>

              {/* Common Uses */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>{t('commonUses')}</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {selectedMed.common_uses.map((u, i) => (
                    <li key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-start">
                      <span className="text-teal-600 font-bold mr-2">•</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Side Effects & Precautions Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Side Effects */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('sideEffects')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedMed.common_side_effects.map((se, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-slate-400 mr-2 font-bold">•</span>
                        <span>{se}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Precautions */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('precautions')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {selectedMed.important_precautions.map((p, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-amber-500 mr-2 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Known Drug Interactions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>{t('interactions')}</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedMed.known_interactions.map((inter, i) => (
                    <li key={i} className="flex items-start p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-400 mr-2 font-bold">•</span>
                      <span>{inter}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overdose & Warning */}
              {selectedMed.overdose_warning && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    {t('overdoseWarning')}
                  </span>
                  <p className="leading-relaxed">{selectedMed.overdose_warning}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{selectedMed.educational_disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-slate-400">
              Select a medicine to view the sample information included in this project.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
