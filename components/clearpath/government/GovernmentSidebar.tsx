'use client';

import { useState, useEffect, useCallback } from 'react';
import CapacitySlider from './CapacitySlider';
import ProposedHospitalPin from './ProposedHospitalPin';
import SimulationResultPanel from './SimulationResultPanel';
import BlueprintPicker from './BlueprintPicker';
import type { Blueprint } from '@/lib/clearpath/blueprints';

interface GovernmentSidebarProps {
  cityId: string;
  onSimulationResult: (result: any) => void;
  onBlueprintChange?: (blueprint: Blueprint | null) => void;
}

export default function GovernmentSidebar({ cityId, onSimulationResult, onBlueprintChange }: GovernmentSidebarProps) {
  const [proposedLocation, setProposedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [capacity, setCapacity] = useState(100);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/clearpath/hospitals?city=${cityId}`)
      .then(r => r.json())
      .then(setHospitals)
      .catch(console.error);
  }, [cityId]);

  useEffect(() => {
    function handleMapClick(e: CustomEvent) {
      setProposedLocation({ lat: e.detail.lat, lng: e.detail.lng });
      setSimResult(null);
    }
    window.addEventListener('clearpath:mapclick' as any, handleMapClick);
    return () => window.removeEventListener('clearpath:mapclick' as any, handleMapClick);
  }, []);

  const runSimulation = useCallback(async () => {
    if (!proposedLocation) return;
    setLoading(true);
    try {
      const res = await fetch('/api/clearpath/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityId,
          proposedLat: proposedLocation.lat,
          proposedLng: proposedLocation.lng,
          proposedCapacity: capacity,
        }),
      });
      const result = await res.json();
      setSimResult(result);
      onSimulationResult(result);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [proposedLocation, capacity, cityId, onSimulationResult]);

  const handleBlueprintSelect = useCallback((bp: Blueprint) => {
    const next = selectedBlueprint?.id === bp.id ? null : bp;
    setSelectedBlueprint(next);
    if (next) setCapacity(next.beds);
    onBlueprintChange?.(next);
  }, [selectedBlueprint, onBlueprintChange]);

  return (
    <div className="h-full bg-white/95 backdrop-blur-xl shadow-xl border border-sky-100 rounded-3xl p-5 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-black text-sky-700 uppercase tracking-tight">
          Planning Console
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Simulate new ER placement and assess impact on the regional hospital network.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-sky-50/60 border border-sky-200/70 rounded-2xl space-y-3">
          <h3 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black text-white">1</span>
            Select Blueprint
          </h3>
          <p className="text-[11px] text-slate-400">
            Choose a building blueprint to place on the map.
          </p>
          <BlueprintPicker selected={selectedBlueprint} onSelect={handleBlueprintSelect} />
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200/70 rounded-2xl space-y-3">
          <h3 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black text-white">2</span>
            {selectedBlueprint ? 'Place Building on Map' : 'Place Proposed ER'}
          </h3>
          <p className="text-[11px] text-slate-400">
            Click anywhere on the map to drop {selectedBlueprint ? 'the building' : 'a proposed ER location'}.
          </p>
          {proposedLocation && (
            <ProposedHospitalPin lat={proposedLocation.lat} lng={proposedLocation.lng} />
          )}
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200/70 rounded-2xl">
          <h3 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black text-white">3</span>
            Set Capacity
          </h3>
          <CapacitySlider value={capacity} onChange={setCapacity} />
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200/70 rounded-2xl">
          <h3 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black text-white">4</span>
            Run Simulation
          </h3>
          <button
            onClick={runSimulation}
            disabled={!proposedLocation || loading}
            className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${proposedLocation && !loading
                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {loading ? 'Running Simulation...' : 'Run Voronoi Simulation'}
          </button>
          {!proposedLocation && (
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Place a pin on the map first
            </p>
          )}
        </div>

        {simResult && (
          <SimulationResultPanel result={simResult} hospitals={hospitals} />
        )}
      </div>
    </div>
  );
}
