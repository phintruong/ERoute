'use client';

import { useState, useCallback, useEffect } from 'react';
import VoiceTriage from './VoiceTriage';
import RoutingResult from './RoutingResult';
import type { TriageResponse, RouteResponse, ScoredHospital } from '@/lib/clearpath/types';

const API_TIMEOUT_MS = 15_000;

interface CivilianPanelProps {
  onRecommendation: (result: RouteResponse | null, routeParams?: Record<string, unknown>) => void;
  currentRecommendation?: RouteResponse & { activeRoute?: ScoredHospital } | null;
}

type Step = 'location' | 'conversation' | 'loading' | 'result';

export default function CivilianPanel({ onRecommendation, currentRecommendation }: CivilianPanelProps) {
  const [step, setStep] = useState<Step>('location');
  const [postalCode, setPostalCode] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state when page.tsx updates recommendation (e.g. from a reroute)
  useEffect(() => {
    if (currentRecommendation && currentRecommendation !== routeResult) {
      setRouteResult(currentRecommendation);
      const activeRoute = currentRecommendation.activeRoute;
      if (activeRoute) {
        const h = activeRoute.hospital as { id?: string; _id?: string } | undefined;
        setActiveRouteId(h?.id ?? h?._id ?? null);
      } else {
        const rec = currentRecommendation.recommended as ScoredHospital | undefined;
        const h = rec?.hospital as { id?: string; _id?: string } | undefined;
        setActiveRouteId(h?.id ?? h?._id ?? null);
      }
    }
  }, [currentRecommendation, routeResult]);

  const handleUseMyLocation = useCallback(() => {
    setLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Location is not supported on this device. Please enter a postal code.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);

        // Reverse geocode to show postal code in the input
        (async () => {
          try {
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            if (!token) return;

            const url =
              `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
              `${coords.lng},${coords.lat}.json` +
              `?country=ca&types=postcode&limit=1&access_token=${token}`;

            const res = await fetch(url);
            if (!res.ok) return;

            const data = (await res.json()) as { features?: Array<{ text?: string; properties?: { postalcode?: string }; place_name?: string }> };
            const feature = data.features?.[0];
            const code =
              feature?.text ||
              feature?.properties?.postalcode ||
              (typeof feature?.place_name === 'string' ? feature.place_name.split(',')[0] : undefined);

            if (code) setPostalCode(code as string);
          } catch (err) {
            console.error('Reverse geocoding failed', err);
          } finally {
            setLocating(false);
          }
        })();
      },
      () => {
        setError('Could not get your location. Please enter a postal code.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // When voice triage is complete, route the patient
  const handleTriageComplete = useCallback(
    async (triage: { severity: 'critical' | 'urgent' | 'non-urgent'; reasoning: string; symptoms: { chestPain: boolean; shortnessOfBreath: boolean; fever: boolean; dizziness: boolean; freeText?: string } | null }) => {
      setTriageResult({ severity: triage.severity, reasoning: triage.reasoning });
      setStep('loading');
      setError(null);

      const routeBody: Record<string, unknown> = {
        severity: triage.severity,
        city: 'toronto',
        symptoms: triage.symptoms || {
          chestPain: false,
          shortnessOfBreath: false,
          fever: false,
          dizziness: false,
          freeText: triage.reasoning,
        },
      };

      if (userCoords) {
        routeBody.userLat = userCoords.lat;
        routeBody.userLng = userCoords.lng;
      } else if (postalCode.trim()) {
        routeBody.postalCode = postalCode.trim();
      } else {
        routeBody.userLat = 43.6532;
        routeBody.userLng = -79.3832;
      }

      try {
        const routeController = new AbortController();
        const routeTimeout = setTimeout(() => routeController.abort(), API_TIMEOUT_MS);

        const routeRes = await fetch('/api/clearpath/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(routeBody),
          signal: routeController.signal,
        });

        clearTimeout(routeTimeout);

        if (!routeRes.ok) {
          let message = 'No hospitals found nearby. Please try again.';
          try {
            const errBody = (await routeRes.json()) as { error?: string };
            if (errBody?.error) message = errBody.error;
          } catch { /* use default */ }
          setError(message);
          setStep('conversation');
          return;
        }

        let route: RouteResponse;
        try {
          const json = await routeRes.json();
          if (json?.recommended && Array.isArray(json?.alternatives) && json?.userLocation) {
            route = json as RouteResponse;
          } else {
            setError('No hospitals found nearby. Please try again.');
            setStep('conversation');
            return;
          }
        } catch {
          setError('No hospitals found nearby. Please try again.');
          setStep('conversation');
          return;
        }

        setRouteResult(route);
        const rec = route.recommended;
        const h = rec?.hospital as { id?: string; _id?: string } | undefined;
        setActiveRouteId(h?.id ?? h?._id ?? null);
        onRecommendation(route, routeBody);
        setStep('result');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request took too long. Please try again.');
        } else {
          setError('Unable to find hospitals right now. Please try again.');
        }
        setStep('conversation');
        console.error(err);
      }
    },
    [userCoords, postalCode, onRecommendation]
  );

  const resetFlow = () => {
    setStep('location');
    setTriageResult(null);
    setRouteResult(null);
    setActiveRouteId(null);
    setUserCoords(null);
    setError(null);
    onRecommendation(null);
  };

  const handleShowRoute = useCallback(
    (scored: ScoredHospital) => {
      if (!routeResult) return;
      const h = scored.hospital as { id?: string; _id?: string };
      const hId = h?.id ?? h?._id ?? null;
      if (hId && hId === activeRouteId) return;
      setActiveRouteId(hId);
      const updated = { ...routeResult, activeRoute: scored };
      onRecommendation(updated, undefined);
    },
    [routeResult, activeRouteId, onRecommendation]
  );

  const canStart = postalCode.trim().length > 0 || userCoords !== null;

  return (
    <div className="h-full bg-white/95 backdrop-blur-xl shadow-xl border border-sky-100 rounded-3xl p-5 overflow-y-auto">
      <div className="mb-5">
        <h2 className="text-lg font-black text-sky-700 uppercase tracking-tight">
          ERoute
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

      {step === 'location' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/90 border border-slate-200/70 rounded-2xl shadow-sm">
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-2">
              Your Postal Code
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => { setPostalCode(e.target.value); setUserCoords(null); }}
              placeholder="e.g. M5B 1W8"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] text-slate-400 uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-colors border border-blue-200 flex items-center justify-center gap-2"
          >
            {locating ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Locating...
              </>
            ) : userCoords ? (
              <>
                <span className="text-green-600">&#10003;</span> Location detected
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Use My Location
              </>
            )}
          </button>

          <button
            onClick={() => setStep('conversation')}
            disabled={!canStart}
            className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${canStart
              ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {step === 'conversation' && (
        <VoiceTriage onTriageComplete={handleTriageComplete} />
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-700">Finding the best ER for you...</p>
          <p className="text-xs text-slate-400 mt-1">Computing optimal route with live traffic</p>
        </div>
      )}

      {step === 'result' && triageResult && routeResult && (
        <RoutingResult
          severity={triageResult.severity}
          reasoning={triageResult.reasoning}
          recommended={routeResult.recommended}
          alternatives={routeResult.alternatives}
          onBack={resetFlow}
          onShowRoute={handleShowRoute}
          activeRouteId={activeRouteId}
        />
      )}

      {/* Progress indicator */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="flex gap-1.5">
          {(['location', 'conversation', 'result'] as const).map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                (['location', 'conversation', 'loading', 'result'] as Step[]).indexOf(step) >= i
                  ? 'bg-sky-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center mt-2 uppercase tracking-wider">
          {step === 'location' && 'Step 1 of 3 — Location'}
          {step === 'conversation' && 'Step 2 of 3 — Tell us what happened'}
          {step === 'loading' && 'Finding your ER...'}
          {step === 'result' && 'Step 3 of 3 — Result'}
        </p>
      </div>
    </div>
  );
}
