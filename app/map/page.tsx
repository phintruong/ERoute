'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import MapPageContent from './MapPageContent';

export default function MapPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-[#0d1117] text-white">Loading map...</div>}>
      <MapPageContent />
    </Suspense>
  );
}
