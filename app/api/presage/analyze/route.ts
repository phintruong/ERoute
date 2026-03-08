import { NextRequest, NextResponse } from 'next/server';
import type { PresageVitals } from '@/lib/clearpath/types';

const MAX_FRAMES = 40;
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const PRESAGE_TIMEOUT_MS = 20_000;

function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((x) => typeof x === 'string');
}

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (Number.isNaN(size) || size > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 400 }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be an object' },
      { status: 400 }
    );
  }

  const { frames } = body as Record<string, unknown>;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return NextResponse.json(
      { error: 'frames must be a non-empty array of base64 image strings' },
      { status: 400 }
    );
  }

  if (!isStringArray(frames)) {
    return NextResponse.json(
      { error: 'Every frame must be a string' },
      { status: 400 }
    );
  }

  if (frames.length > MAX_FRAMES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FRAMES} frames allowed` },
      { status: 400 }
    );
  }

  const payloadBytes = new Blob([JSON.stringify({ frames })]).size;
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 400 }
    );
  }

  const presageKey = process.env.presage_key;
  const presageUrl = process.env.PRESAGE_API_URL;

  if (!presageKey || !presageUrl) {
    return NextResponse.json(
      { error: 'Presage endpoint not implemented' },
      { status: 501 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRESAGE_TIMEOUT_MS);

  try {
    const res = await fetch(presageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${presageKey}`,
      },
      body: JSON.stringify({ frames }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      console.error('Presage API error:', res.status, text.slice(0, 500));
      return NextResponse.json(
        { error: 'Face analysis failed' },
        { status: 500 }
      );
    }

    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      console.error('Presage API returned non-JSON (likely HTML):', res.status, text.slice(0, 300));
      return NextResponse.json(
        { error: 'Presage endpoint returned an invalid response. Check PRESAGE_API_URL and API docs.' },
        { status: 500 }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      console.error('Presage API response was not valid JSON:', text.slice(0, 300));
      return NextResponse.json(
        { error: 'Invalid Presage response' },
        { status: 500 }
      );
    }

    if (
      data === null ||
      typeof data !== 'object' ||
      !('hr' in data) ||
      !('rr' in data) ||
      !('stress' in data)
    ) {
      return NextResponse.json(
        { error: 'Invalid Presage response' },
        { status: 500 }
      );
    }

    const raw = data as Record<string, unknown>;
    const hr = Number(raw.hr);
    const rr = Number(raw.rr);
    const stress = Number(raw.stress);

    if (
      Number.isNaN(hr) ||
      Number.isNaN(rr) ||
      Number.isNaN(stress)
    ) {
      return NextResponse.json(
        { error: 'Invalid Presage response values' },
        { status: 500 }
      );
    }

    const result: PresageVitals = { hr, rr, stress };
    return NextResponse.json(result);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Analysis timed out' },
          { status: 500 }
        );
      }
      console.error('Presage request failed:', err.message);
    }
    return NextResponse.json(
      { error: 'Face analysis failed' },
      { status: 500 }
    );
  }
}
