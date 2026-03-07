import { TriageRequest, TriageResponse } from '../../../shared/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function submitTriage(data: TriageRequest): Promise<TriageResponse> {
  const response = await fetch(`${API_URL}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Triage request failed');
  }

  return response.json();
}
