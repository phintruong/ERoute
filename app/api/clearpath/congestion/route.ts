import { NextRequest, NextResponse } from 'next/server';
import { congestionService } from '@/lib/clearpath/congestionService';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? 'toronto';
  const data = await congestionService.getCongestion(city);
  return NextResponse.json(data);
}
