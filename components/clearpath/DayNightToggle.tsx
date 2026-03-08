'use client';

interface DayNightToggleProps {
  theme: 'night' | 'day' | 'satellite';
  onChange: (theme: 'night' | 'day' | 'satellite') => void;
}

export default function DayNightToggle({ theme, onChange }: DayNightToggleProps) {
  const knobClass =
    theme === 'day'
      ? 'cp-theme-knob cp-theme-knob--middle'
      : theme === 'satellite'
        ? 'cp-theme-knob cp-theme-knob--right'
        : 'cp-theme-knob';

  return (
    <div className="cp-theme-toggle" role="group" aria-label="Map style">
      <span className={knobClass} />
      <button
        type="button"
        onClick={() => onChange('night')}
        className={`cp-theme-label ${theme === 'night' ? 'cp-theme-label--active' : ''}`}
        aria-label="Switch to night mode"
      >
        Night
      </button>
      <button
        type="button"
        onClick={() => onChange('day')}
        className={`cp-theme-label ${theme === 'day' ? 'cp-theme-label--active' : ''}`}
        aria-label="Switch to day mode"
      >
        Day
      </button>
      <button
        type="button"
        onClick={() => onChange('satellite')}
        className={`cp-theme-label ${theme === 'satellite' ? 'cp-theme-label--active' : ''}`}
        aria-label="Switch to satellite mode"
      >
        Sat
      </button>
    </div>
  );
}
