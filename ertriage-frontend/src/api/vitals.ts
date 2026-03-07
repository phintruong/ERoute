const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function validateVitals(payload: {
  heartRate: number;
  respiratoryRate: number;
  stressIndex: number;
  emotionState?: string;
}) {
  const response = await fetch(`${API_URL}/vitals/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Vitals validation failed');
  }

  return response.json();
}
