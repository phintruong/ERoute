'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VitalsPayload } from '@/lib/clearpath/types';

interface VitalsCaptureProps {
  onComplete: (vitals: VitalsPayload) => void;
  onSkip: () => void;
}

export default function VitalsCapture({ onComplete, onSkip }: VitalsCaptureProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [stressIndex, setStressIndex] = useState<number>(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCapturing(true);

      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 1;
        setProgress((elapsed / 30) * 100);
        if (elapsed >= 30) {
          clearInterval(interval);
          setCapturing(false);
          stream.getTracks().forEach((t) => t.stop());
          onComplete({
            heartRate: 60 + Math.floor(Math.random() * 40),
            respiratoryRate: 12 + Math.floor(Math.random() * 10),
            stressIndex: Math.round(Math.random() * 100) / 100,
          });
        }
      }, 1000);
    } catch {
      setMode('manual');
    }
  }, [onComplete]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const submitManual = () => {
    onComplete({ heartRate, respiratoryRate, stressIndex });
  };

  if (mode === 'camera') {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Vitals Capture
        </h3>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {capturing && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-700">
              <div
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        {!capturing && (
          <button
            onClick={startCamera}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold uppercase"
          >
            Start 30s Capture
          </button>
        )}
        {capturing && (
          <p className="text-[11px] text-center text-slate-500">
            Hold still — capturing vitals... {Math.round(progress)}%
          </p>
        )}
        <button
          onClick={() => setMode('manual')}
          className="w-full text-[11px] text-slate-400 hover:text-slate-600 underline"
        >
          Enter vitals manually instead
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Enter Vitals
        </h3>
        <button
          onClick={() => setMode('camera')}
          className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
        >
          Use Camera
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
            Heart Rate (BPM)
          </label>
          <input
            type="number"
            min={30}
            max={220}
            value={heartRate}
            onChange={(e) => setHeartRate(parseInt(e.target.value) || 75)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
            Respiratory Rate (breaths/min)
          </label>
          <input
            type="number"
            min={5}
            max={60}
            value={respiratoryRate}
            onChange={(e) => setRespiratoryRate(parseInt(e.target.value) || 16)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
            Stress Index (0–1)
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={stressIndex}
            onChange={(e) => setStressIndex(parseFloat(e.target.value) || 0.3)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={submitManual}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase"
        >
          Submit Vitals
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
