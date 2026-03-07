'use client';

interface ModeToggleProps {
  mode: 'government' | 'civilian';
  onChange: (mode: 'government' | 'civilian') => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden shadow-lg border border-white/20 backdrop-blur-md">
      <button
        onClick={() => onChange('government')}
        className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
          mode === 'government'
            ? 'bg-blue-700 text-white'
            : 'bg-white/80 text-slate-600 hover:bg-white'
        }`}
      >
        Government
      </button>
      <button
        onClick={() => onChange('civilian')}
        className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
          mode === 'civilian'
            ? 'bg-red-600 text-white'
            : 'bg-white/80 text-slate-600 hover:bg-white'
        }`}
      >
        Civilian
      </button>
    </div>
  );
}
