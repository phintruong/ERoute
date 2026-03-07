'use client';
import { useState, useCallback } from 'react';
import ClearPathMap from '@/components/clearpath/ClearPathMap';
import ModeToggle from '@/components/clearpath/ModeToggle';
import GovernmentSidebar from '@/components/clearpath/government/GovernmentSidebar';
import CivilianPanel from '@/components/clearpath/civilian/CivilianPanel';

export default function MapPage() {
  const [mode, setMode] = useState<'government' | 'civilian'>('civilian');
  const [simulationResult, setSimulationResult] = useState(null);
  const [recommendedHospital, setRecommendedHospital] = useState(null);
  const [proposedLocation, setProposedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = useCallback((lngLat: { lng: number; lat: number }) => {
    if (mode === 'government') {
      setProposedLocation({ lat: lngLat.lat, lng: lngLat.lng });
      window.dispatchEvent(new CustomEvent('clearpath:mapclick', { detail: lngLat }));
    }
  }, [mode]);

  return (
    <div className='relative w-full h-screen'>
      <ClearPathMap
        mode={mode}
        simulationResult={simulationResult}
        recommendedHospital={recommendedHospital}
        onMapClick={handleMapClick}
        proposedLocation={proposedLocation}
      />
      <div className='absolute top-4 right-4 z-10'>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      <div className='absolute top-0 left-0 h-full w-96 z-10'>
        {mode === 'government' ? (
          <GovernmentSidebar onSimulationResult={setSimulationResult} />
        ) : (
          <CivilianPanel onRecommendation={setRecommendedHospital} />
        )}
      </div>
    </div>
  );
}
