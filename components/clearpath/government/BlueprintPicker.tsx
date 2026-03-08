'use client';

import { PRESET_BLUEPRINTS, type Blueprint } from '@/lib/clearpath/blueprints';

interface BlueprintPickerProps {
  selected: Blueprint | null;
  onSelect: (blueprint: Blueprint) => void;
  customBlueprints?: Blueprint[];
}

function BlueprintCard({ bp, isActive, onSelect, badge }: { bp: Blueprint; isActive: boolean; onSelect: () => void; badge?: string }) {
  return (
    <button
      key={bp.id}
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${isActive
        ? 'border-sky-400 bg-sky-500 text-white shadow-md'
        : 'border-sky-200/70 bg-white hover:border-sky-300 hover:bg-sky-50/50 text-slate-700'
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
            {bp.name}
          </span>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-sky-600 text-sky-100' : 'bg-violet-100 text-violet-600'}`}>
              {badge}
            </span>
          )}
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-sky-600 text-sky-100' : 'bg-sky-50 text-sky-600'
          }`}>
          {bp.beds} beds
        </span>
      </div>
      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
        {bp.description}
      </p>
    </button>
  );
}

export default function BlueprintPicker({ selected, onSelect, customBlueprints = [] }: BlueprintPickerProps) {
  return (
    <div className="space-y-2">
      {customBlueprints.map((bp) => (
        <BlueprintCard
          key={bp.id}
          bp={bp}
          isActive={selected?.id === bp.id}
          onSelect={() => onSelect(bp)}
          badge="Custom"
        />
      ))}
      {customBlueprints.length > 0 && PRESET_BLUEPRINTS.length > 0 && (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-sky-200/60" />
          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Presets</span>
          <div className="flex-1 h-px bg-sky-200/60" />
        </div>
      )}
      {PRESET_BLUEPRINTS.map((bp) => (
        <BlueprintCard
          key={bp.id}
          bp={bp}
          isActive={selected?.id === bp.id}
          onSelect={() => onSelect(bp)}
        />
      ))}
    </div>
  );
}

