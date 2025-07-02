import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dispatch_id = searchParams.get('dispatch_id');

    if (!dispatch_id) {
      return NextResponse.json(
        { error: 'Dispatch ID is required' },
        { status: 400 }
      );
    }

    const data = await db.getGpsData(Number(dispatch_id));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GPS history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GPS history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { dispatch_id, latitude, longitude } = await request.json();
    
    if (!dispatch_id || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Dispatch ID and coordinates are required' },
        { status: 400 }
      );
    }

    const result = await db.saveGpsData({
      dispatch_id,
      lat: latitude.toString(),
      lng: longitude.toString(),
      latlng: `${latitude},${longitude}`
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GPS tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to save GPS data' },
      { status: 500 }
    );
  }
} 