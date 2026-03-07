'use client';

import { useState } from 'react';
import { SymptomsPayload } from '@/lib/clearpath/types';

interface SymptomCardsProps {
  onComplete: (symptoms: SymptomsPayload) => void;
}

export default function SymptomCards({ onComplete }: SymptomCardsProps) {
  const [chestPain, setChestPain] = useState(false);
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false);
  const [fever, setFever] = useState(false);
  const [feverDays, setFeverDays] = useState<number | ''>(1);
  const [dizziness, setDizziness] = useState(false);
  const [freeText, setFreeText] = useState('');

  const handleSubmit = () => {
    onComplete({
      chestPain,
      shortnessOfBreath,
      fever,
      feverDays: fever && typeof feverDays === 'number' ? feverDays : undefined,
      dizziness,
      freeText: freeText.trim() || undefined,
    });
  };

  const cards: Array<{
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    color: string;
  }> = [
    { label: 'Chest Pain', value: chestPain, onChange: setChestPain, color: 'red' },
    { label: 'Shortness of Breath', value: shortnessOfBreath, onChange: setShortnessOfBreath, color: 'orange' },
    { label: 'Fever', value: fever, onChange: setFever, color: 'amber' },
    { label: 'Dizziness', value: dizziness, onChange: setDizziness, color: 'purple' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Symptom Check
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => card.onChange(!card.value)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              card.value
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <p className="text-[11px] font-bold text-slate-800">{card.label}</p>
            <p className={`text-[10px] font-bold mt-1 ${card.value ? 'text-red-600' : 'text-slate-400'}`}>
              {card.value ? 'YES' : 'NO'}
            </p>
          </button>
        ))}
      </div>

      {fever && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <label className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
            How many days of fever?
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={feverDays}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') {
                setFeverDays('');
                return;
              }
              const n = parseInt(v, 10);
              if (!Number.isNaN(n)) {
                setFeverDays(n);
              }
            }}
            className="w-full px-3 py-1.5 border border-amber-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
          Describe your main symptom
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="e.g. sharp pain in lower abdomen for 2 hours..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-colors"
      >
        Get Triage Assessment
      </button>
    </div>
  );
}
