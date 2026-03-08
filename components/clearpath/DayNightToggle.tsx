'use client';

interface DayNightToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export default function DayNightToggle({ isDark, onToggle }: DayNightToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200/80 hover:bg-white hover:shadow-xl transition-all duration-200 group"
            aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
            title={isDark ? 'Day mode' : 'Night mode'}
        >
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                {isDark ? '☀️' : '🌙'}
            </span>
        </button>
    );
}
