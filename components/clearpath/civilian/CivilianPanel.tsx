'use client';

import { useState, useCallback } from 'react';
import VitalsCapture from './VitalsCapture';
import SymptomCards from './SymptomCards';
import RoutingResult from './RoutingResult';
import { VitalsPayload, SymptomsPayload } from '@/lib/clearpath/types';

interface CivilianPanelProps {
  onRecommendation: (result: any) => void;
}

type Step = 'address' | 'vitals' | 'symptoms' | 'loading' | 'result';

export default function CivilianPanel({ onRecommendation }: CivilianPanelProps) {
  const [step, setStep] = useState<Step>('address');
  const [postalCode, setPostalCode] = useState('');
  const [vitals, setVitals] = useState<VitalsPayload | null>(null);
  const [triageResult, setTriageResult] = useState<any>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVitalsComplete = useCallback((v: VitalsPayload) => {
    setVitals(v);
    setStep('symptoms');
  }, []);

  const handleVitalsSkip = useCallback(() => {
    setVitals({ heartRate: 75, respiratoryRate: 16, stressIndex: 0.3 });
    setStep('symptoms');
  }, []);

  const handleSymptomsComplete = useCallback(
    async (symptoms: SymptomsPayload) => {
      setStep('loading');
      setError(null);

      const effectiveVitals = vitals ?? { heartRate: 75, respiratoryRate: 16, stressIndex: 0.3 };

      try {
        const triageRes = await fetch('/api/clearpath/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vitals: effectiveVitals,
            symptoms,
            city: 'toronto',
          }),
        });
        const triage = await triageRes.json();
        setTriageResult(triage);

        const routeRes = await fetch('/api/clearpath/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userLat: 43.6532,
            userLng: -79.3832,
            severity: triage.severity,
            city: 'toronto',
          }),
        });
        const route = await routeRes.json();
        setRouteResult(route);
        onRecommendation(route);
        setStep('result');
      } catch (err) {
        setError('Failed to complete triage. Please try again.');
        setStep('symptoms');
        console.error(err);
      }
    },
    [vitals, onRecommendation]
  );

  const resetFlow = () => {
    setStep('address');
    setVitals(null);
    setTriageResult(null);
    setRouteResult(null);
    setError(null);
    onRecommendation(null);
  };

  return (
    <div className="h-full bg-white/90 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.65)] border border-white/20 rounded-3xl p-5 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-black text-red-700 uppercase tracking-tight">
          ClearPath ER
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Find the right ER for your situation.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/95 border border-red-200/80 rounded-2xl text-xs text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {step === 'address' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/90 border border-slate-200/70 rounded-2xl shadow-sm">
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-2">
              Your Postal Code / Address
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. M5B 1W8"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <button
            onClick={() => setStep('vitals')}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold uppercase tracking-wide transition-colors"
          >
            Start Triage
          </button>
        </div>
      )}

      {step === 'vitals' && (
        <VitalsCapture onComplete={handleVitalsComplete} onSkip={handleVitalsSkip} />
      )}

      {step === 'symptoms' && (
        <SymptomCards onComplete={handleSymptomsComplete} />
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-700">Analyzing your symptoms...</p>
          <p className="text-xs text-slate-400 mt-1">Consulting AI triage system</p>
        </div>
      )}

      {step === 'result' && triageResult && routeResult && (
        <RoutingResult
          severity={triageResult.severity}
          reasoning={triageResult.reasoning}
          hospital={routeResult.hospital}
          distanceKm={routeResult.distanceKm}
          waitMinutes={routeResult.waitMinutes}
          reason={routeResult.reason}
          onBack={resetFlow}
        />
      )}

      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="flex gap-1.5">
          {(['address', 'vitals', 'symptoms', 'result'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                (['address', 'vitals', 'symptoms', 'loading', 'result'] as Step[]).indexOf(step) >= i
                  ? 'bg-red-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center mt-2 uppercase tracking-wider">
          {step === 'address' && 'Step 1 of 4 — Location'}
          {step === 'vitals' && 'Step 2 of 4 — Vitals'}
          {step === 'symptoms' && 'Step 3 of 4 — Symptoms'}
          {step === 'loading' && 'Processing...'}
          {step === 'result' && 'Step 4 of 4 — Result'}
        </p>
      </div>
    </div>
  );
}
