const CONGESTION_NUMERIC: Record<string, number> = {
  low: 1,
  moderate: 2,
  heavy: 3,
  severe: 4,
  unknown: 1,
};

const NUMERIC_TO_LEVEL = ['low', 'moderate', 'heavy', 'severe'] as const;

const TRAFFIC_MULTIPLIERS: Record<string, number[]> = {
  weekday: [
    0.85, 0.80, 0.80, 0.80, 0.85, 0.95,
    1.15, 1.40, 1.45, 1.20, 1.05, 1.00,
    1.05, 1.00, 1.00, 1.10, 1.35, 1.45,
    1.25, 1.10, 1.00, 0.95, 0.90, 0.85,
  ],
  weekend: [
    0.80, 0.75, 0.75, 0.75, 0.75, 0.80,
    0.85, 0.90, 0.95, 1.00, 1.05, 1.10,
    1.10, 1.05, 1.05, 1.05, 1.00, 0.95,
    0.90, 0.85, 0.85, 0.80, 0.80, 0.80,
  ],
};

function getDayType(d: Date): string {
  return [0, 6].includes(d.getDay()) ? 'weekend' : 'weekday';
}

function getMultiplier(d: Date): number {
  const dayType = getDayType(d);
  const hour = d.getHours();
  const minute = d.getMinutes();
  const currentMult = TRAFFIC_MULTIPLIERS[dayType][hour];
  const nextMult = TRAFFIC_MULTIPLIERS[dayType][(hour + 1) % 24];
  return currentMult + (nextMult - currentMult) * (minute / 60);
}

export interface PredictedSegment {
  congestion: string;
  color: string;
}

export interface TimelinePrediction {
  minutesFromNow: number;
  label: string;
  segments: PredictedSegment[];
  avgCongestionLevel: number;
  drivingTimeMultiplier: number;
}

const COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  heavy: '#f97316',
  severe: '#dc2626',
};

export function predictTrafficTimeline(
  baseCongestionSegments: string[] | undefined,
  baseCount: number,
  steps: number = 13,
  intervalMinutes: number = 5,
): TimelinePrediction[] {
  const now = new Date();
  const nowMult = getMultiplier(now);

  const baseSegments = baseCongestionSegments?.length
    ? baseCongestionSegments
    : Array(Math.max(baseCount, 1)).fill('low');

  const baseNumeric = baseSegments.map(s => CONGESTION_NUMERIC[s] ?? 1);

  const predictions: TimelinePrediction[] = [];

  for (let step = 0; step < steps; step++) {
    const minutesFromNow = step * intervalMinutes;
    const futureDate = new Date(now.getTime() + minutesFromNow * 60_000);
    const futureMult = getMultiplier(futureDate);

    const ratio = futureMult / (nowMult || 1);

    const segments: PredictedSegment[] = baseNumeric.map(baseLevel => {
      const adjusted = Math.round(baseLevel * ratio);
      const clamped = Math.max(1, Math.min(4, adjusted));
      const level = NUMERIC_TO_LEVEL[clamped - 1];
      return { congestion: level, color: COLORS[level] };
    });

    const avgLevel = segments.reduce(
      (sum, s) => sum + (CONGESTION_NUMERIC[s.congestion] ?? 1), 0
    ) / (segments.length || 1);

    const hours = futureDate.getHours();
    const mins = futureDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const label = minutesFromNow === 0 ? 'Now' : `${h12}:${mins} ${ampm}`;

    predictions.push({
      minutesFromNow,
      label,
      segments,
      avgCongestionLevel: Math.round(avgLevel * 10) / 10,
      drivingTimeMultiplier: Math.round(ratio * 100) / 100,
    });
  }

  return predictions;
}

export function shouldReroute(
  currentPrediction: TimelinePrediction,
  threshold: number = 2.5,
): boolean {
  return currentPrediction.avgCongestionLevel >= threshold;
}
