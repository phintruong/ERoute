import { VitalsPayload } from './types';

export function validateVitals(raw: VitalsPayload): VitalsPayload {
  if (raw.heartRate < 30 || raw.heartRate > 220)
    throw new Error('Heart rate out of valid range');
  if (raw.respiratoryRate < 5 || raw.respiratoryRate > 60)
    throw new Error('Respiratory rate out of valid range');
  if (raw.stressIndex < 0 || raw.stressIndex > 1)
    throw new Error('Stress index must be 0–1');
  return raw;
}
