'use client';

interface CapacitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function CapacitySlider({ value, onChange }: CapacitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          ER Bed Capacity
        </label>
        <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {value} beds
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={500}
        step={10}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-600
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-grab"
      />
      <div className="flex justify-between text-[9px] text-slate-400 font-medium">
        <span>0</span>
        <span>250</span>
        <span>500</span>
      </div>
    </div>
  );
}
