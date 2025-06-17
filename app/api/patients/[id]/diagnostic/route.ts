import { NextResponse } from 'next/server';
import { db, pool } from '@/lib/db';

// Helper to get diagnosticId
async function getDiagnosticIdByPatientId(patientId: string): Promise<string | null> {
  const [rows] = await pool.query('SELECT id FROM patient_diagnostics WHERE patient_id = ?', [patientId]);
  // @ts-ignore
  return rows && rows[0] && rows[0].id ? rows[0].id : null;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    console.log('Received diagnostic data:', data);
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const existingPatient = await db.getPatient(id);
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    console.log('Existing patient data:', existingPatient);

    // Update only diagnostic-related fields
    const diagnosticData = {
      chiefComplaint: data.chiefComplaint,
      pertinentSymptoms: data.pertinentSymptoms,
      allergies: data.allergies,
      currentMedications: data.currentMedications,
      pastMedicalHistory: data.pastMedicalHistory,
      lastOralIntake: data.lastOralIntake,
      historyOfPresentIllness: data.historyOfPresentIllness,
      vitalSigns: data.vitalSigns
    };

    console.log('Updating with diagnostic data:', diagnosticData);

    const updatedPatient = await db.updatePatient(id, diagnosticData);
    
    console.log('Successfully updated patient:', updatedPatient);

    // Get the diagnostic ID from the patient_diagnostics table
    const diagnosticId = await getDiagnosticIdByPatientId(id);

    return NextResponse.json({
      ...updatedPatient,
      diagnosticId
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update patient',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 