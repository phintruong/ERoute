'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  predictTrafficTimeline,
  shouldReroute,
  type TimelinePrediction,
} from '@/lib/clearpath/trafficPrediction';

interface TrafficTimelineProps {
  congestionSegments?: string[];
  segmentCount: number;
  onTimeChange: (prediction: TimelinePrediction, isDragging: boolean) => void;
  onRerouteRequest: () => void;
}

const CONGESTION_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  heavy: '#f97316',
  severe: '#dc2626',
};

export default function TrafficTimeline({
  congestionSegments,
  segmentCount,
  onTimeChange,
  onRerouteRequest,
}: TrafficTimelineProps) {
  const [activeStep, setActiveStep] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const predictions = useMemo(
    () => predictTrafficTimeline(congestionSegments, segmentCount, 13, 5),
    [congestionSegments, segmentCount]
  );

  const current = predictions[activeStep];
  const rerouteAvailable = current ? shouldReroute(current) : false;

  const updateStep = useCallback(
    (clientX: number, isDrag: boolean) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const step = Math.round(pct * (predictions.length - 1));
      setActiveStep(step);
      onTimeChange(predictions[step], isDrag);
    },
    [predictions, onTimeChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateStep(e.clientX, true);
    },
    [updateStep]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updateStep(e.clientX, true);
    },
    [updateStep]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    // When the slider is released, treat it as inactive:
    // keep the selected time, but switch the map back to showing
    // the full route instead of a partial progress slice.
    if (predictions[activeStep]) {
      onTimeChange(predictions[activeStep], false);
    }
  }, [activeStep, onTimeChange, predictions]);

  useEffect(() => {
    if (predictions[0]) {
      onTimeChange(predictions[0], false);
    }
    // We intentionally only fire on first mount for the initial "Now" state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) return null;

  const thumbPct = (activeStep / Math.max(predictions.length - 1, 1)) * 100;

  const segColors = current.segments;
  const barGradient = segColors.length > 1
    ? `linear-gradient(to right, ${segColors.map((s, i) => `${s.color} ${(i / (segColors.length - 1)) * 100}%`).join(', ')})`
    : segColors[0]?.color ?? '#22c55e';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-32rem)] min-w-[320px] max-w-[700px]">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
              Traffic Prediction
            </span>
          </div>
          <span className="text-[12px] font-bold text-white">
            {current.label}
          </span>
        </div>

        {/* Congestion preview bar */}
        <div
          className="h-2 rounded-full mb-3 transition-all duration-300"
          style={{ background: barGradient }}
        />

        {/* Slider track */}
        <div
          ref={trackRef}
          className="relative h-6 cursor-pointer touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-slate-700" />

          {/* Tick marks */}
          {predictions.map((p, i) => {
            const pct = (i / (predictions.length - 1)) * 100;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                style={{
                  left: `${pct}%`,
                  backgroundColor:
                    i <= activeStep ? '#e2e8f0' : '#475569',
                }}
              />
            );
          })}

          {/* Filled track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full transition-all duration-150"
            style={{
              width: `${thumbPct}%`,
              background: CONGESTION_COLORS[current.segments[0]?.congestion ?? 'low'],
            }}
          />

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] border-2 border-slate-300 transition-left duration-150"
            style={{ left: `${thumbPct}%` }}
          />
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-slate-400">Now</span>
          <span className="text-[9px] text-slate-400">{predictions[predictions.length - 1]?.label}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    current.avgCongestionLevel < 1.5
                      ? '#22c55e'
                      : current.avgCongestionLevel < 2.5
                        ? '#eab308'
                        : current.avgCongestionLevel < 3.5
                          ? '#f97316'
                          : '#dc2626',
                }}
              />
              <span className="text-[10px] text-slate-300 font-medium">
                {current.avgCongestionLevel < 1.5
                  ? 'Clear'
                  : current.avgCongestionLevel < 2.5
                    ? 'Moderate'
                    : current.avgCongestionLevel < 3.5
                      ? 'Heavy'
                      : 'Severe'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Drive time: {current.drivingTimeMultiplier > 1 ? '+' : ''}
              {Math.round((current.drivingTimeMultiplier - 1) * 100)}%
            </span>
          </div>

          {rerouteAvailable && (
            <button
              onClick={onRerouteRequest}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors animate-pulse"
            >
              Reroute Available
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2">
          {(['low', 'moderate', 'heavy', 'severe'] as const).map((level) => (
            <div key={level} className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: CONGESTION_COLORS[level] }}
              />
              <span className="text-[8px] text-slate-500 capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
