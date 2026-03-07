import { NextRequest, NextResponse } from 'next/server';
import { recommendHospital } from '@/lib/clearpath/routingService';
import { getDb } from '@/lib/clearpath/mongoClient';
import { RouteRequest } from '@/lib/clearpath/types';

export async function POST(req: NextRequest) {
  const body: RouteRequest = await req.json();
  const db = await getDb();

  const hospitals = await db.collection('hospitals')
    .find({ city: body.city }).toArray();
  const snapshots = await db.collection('congestion_snapshots')
    .find({}).sort({ recordedAt: -1 }).toArray();

  const recommendation = recommendHospital(
    body.userLat, body.userLng, body.severity, hospitals, snapshots
  );
  return NextResponse.json(recommendation);
}
