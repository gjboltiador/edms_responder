import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching patients for alert ID:', id);
    
    if (!id) {
      console.error('API: Alert ID is missing');
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const incidentId = parseInt(id);
    if (isNaN(incidentId)) {
      console.error('API: Invalid alert ID format:', id);
      return NextResponse.json(
        { error: 'Invalid alert ID format' },
        { status: 400 }
      );
    }

    console.log('API: Calling getPatientsByIncident with ID:', incidentId);
    const patients = await db.getPatientsByIncident(incidentId);
    console.log('API: Found patients:', JSON.stringify(patients, null, 2));
    
    console.log('API: Returning patients:', JSON.stringify(patients, null, 2));
    return NextResponse.json(patients);
  } catch (error) {
    console.error('API: Error fetching patients for alert:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch patients' },
      { status: 500 }
    );
  }
} 