import { TriageSession, UserProfile } from '../../../shared/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user profile');
  return response.json();
}

export async function fetchHistory(): Promise<TriageSession[]> {
  // TODO: get userId from auth state
  const response = await fetch(`${API_URL}/history/me`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}
