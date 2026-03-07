import { NextRequest, NextResponse } from 'next/server';
import { classifyTriage } from '@/lib/clearpath/geminiService';
import { validateVitals } from '@/lib/clearpath/presageService';
import { TriageRequest } from '@/lib/clearpath/types';

export async function POST(req: NextRequest) {
  const body: TriageRequest = await req.json();
  const validatedVitals = validateVitals(body.vitals);
  const result = await classifyTriage(validatedVitals, body.symptoms);
  return NextResponse.json(result);
}
