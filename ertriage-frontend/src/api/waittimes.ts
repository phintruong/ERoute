const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWaitTime(city: string): Promise<{ city: string; waitTime: string }> {
  const response = await fetch(`${API_URL}/waittimes/${encodeURIComponent(city)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch wait time');
  }

  return response.json();
}
