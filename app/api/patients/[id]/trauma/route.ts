import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id;
    const traumaData = await request.json();

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Check if patient exists
    const patient = await db.getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Upsert trauma info (update if exists, insert if not)
    const updatedTrauma = await db.updatePatientTrauma(patientId, traumaData);

    return NextResponse.json(updatedTrauma);
  } catch (error) {
    console.error('Error saving trauma info:', error);
    return NextResponse.json({ error: 'Failed to save trauma info', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 