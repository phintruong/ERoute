import { getWaitTime, setWaitTime } from '../cache/redis';

export async function fetchWaitTime(city: string): Promise<string> {
  // Check cache first
  const cached = await getWaitTime(city);
  if (cached) return cached;

  // TODO: Implement CIHI data fetch
  // For now, return hardcoded data for demo
  const mockWaitTimes: Record<string, string> = {
    kitchener: '4-6 hours',
    toronto: '5-8 hours',
    ottawa: '3-5 hours',
    vancouver: '4-7 hours',
    montreal: '6-9 hours',
    calgary: '3-5 hours',
    edmonton: '4-6 hours',
    winnipeg: '3-4 hours',
    halifax: '4-6 hours',
  };

  const waitTime = mockWaitTimes[city.toLowerCase()] || '3-6 hours (estimate)';

  // Cache the result
  await setWaitTime(city, waitTime);

  return waitTime;
}
