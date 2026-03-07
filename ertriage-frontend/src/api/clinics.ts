import { ClinicResult } from '../../../shared/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchNearbyClinics(lat: number, lng: number): Promise<{ clinics: ClinicResult[] }> {
  const response = await fetch(`${API_URL}/clinics/${lat}/${lng}`);

  if (!response.ok) {
    throw new Error('Failed to fetch nearby clinics');
  }

  return response.json();
}
