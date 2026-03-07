interface PresagePayload {
  heartRate: number;
  respiratoryRate: number;
  stressIndex: number;
  emotionState?: string;
}

export function validateVitals(raw: PresagePayload) {
  if (raw.heartRate < 30 || raw.heartRate > 200) {
    throw new Error('Heart rate out of range (30-200 bpm)');
  }
  if (raw.respiratoryRate < 5 || raw.respiratoryRate > 50) {
    throw new Error('Respiratory rate out of range (5-50 breaths/min)');
  }
  if (raw.stressIndex < 0 || raw.stressIndex > 100) {
    throw new Error('Stress index out of range (0-100)');
  }

  return {
    hr: raw.heartRate,
    rr: raw.respiratoryRate,
    stress: raw.stressIndex,
    emotion: raw.emotionState || 'unknown',
  };
}
