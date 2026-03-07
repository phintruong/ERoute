'use client';

interface RoutingResultProps {
  severity: 'critical' | 'urgent' | 'non-urgent';
  reasoning: string;
  hospital: {
    name: string;
    phone?: string;
    website?: string;
  };
  distanceKm: number;
  waitMinutes: number;
  reason: string;
  onBack: () => void;
}

const severityConfig = {
  critical: { bg: 'bg-red-600', text: 'text-white', label: 'CRITICAL' },
  urgent: { bg: 'bg-orange-500', text: 'text-white', label: 'URGENT' },
  'non-urgent': { bg: 'bg-green-500', text: 'text-white', label: 'NON-URGENT' },
};

export default function RoutingResult({
  severity,
  reasoning,
  hospital,
  distanceKm,
  waitMinutes,
  reason,
  onBack,
}: RoutingResultProps) {
  const config = severityConfig[severity];

  return (
    <div className="space-y-4">
      <div className={`${config.bg} rounded-lg p-4 text-center`}>
        <p className={`text-[10px] font-bold ${config.text} uppercase tracking-widest opacity-80`}>
          Triage Level
        </p>
        <p className={`text-2xl font-black ${config.text} uppercase tracking-tight`}>
          {config.label}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">AI Assessment</p>
        <p className="text-[11px] text-slate-700 leading-relaxed">{reasoning}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
          Recommended Hospital
        </h3>
        <p className="text-base font-bold text-blue-700">{hospital.name}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] font-bold text-blue-500 uppercase">Distance</p>
            <p className="text-lg font-black text-blue-800">{distanceKm} km</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] font-bold text-amber-500 uppercase">Est. Wait</p>
            <p className="text-lg font-black text-amber-800">{waitMinutes} min</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">{reason}</p>

        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold text-center uppercase transition-colors"
          >
            Call {hospital.phone}
          </a>
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        Start Over
      </button>
    </div>
  );
}
