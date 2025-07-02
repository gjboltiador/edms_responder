import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Update all patient fields if provided
    const updateData = {
      name: data.name,
      age: data.age,
      gender: data.gender,
      address: data.address,
      contactNumber: data.contactNumber,
      contactPerson: data.contactPerson,
      chiefComplaint: data.chiefComplaint,
      pertinentSymptoms: data.pertinentSymptoms,
      allergies: data.allergies,
      currentMedications: data.currentMedications,
      pastMedicalHistory: data.pastMedicalHistory,
      lastOralIntake: data.lastOralIntake,
      historyOfPresentIllness: data.historyOfPresentIllness,
      vitalSigns: data.vitalSigns,
      patientStatus: data.patientStatus,
      management: data.management,
      causeOfInjuries: data.causeOfInjuries,
      typesOfInjuries: data.typesOfInjuries,
      locationOfIncident: data.locationOfIncident,
      remarks: data.remarks
    };

    console.log('Updating with data:', updateData);

    const updatedPatient = await db.updatePatient(id, updateData);
    
    if (!updatedPatient || !updatedPatient.id) {
      console.error('Update succeeded but failed to fetch updated patient or patient ID is missing:', updatedPatient);
      return NextResponse.json(
        { error: 'Update succeeded but failed to fetch updated patient or patient ID is missing.' },
        { status: 500 }
      );
    }
    
    console.log('Successfully updated patient:', updatedPatient);

    return NextResponse.json(updatedPatient);
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log('=== API: GET /api/patients/[id] ===');
  console.log('Patient ID:', params.id);

  try {
    const patient = await db.getPatient(params.id);
    console.log('Retrieved patient:', patient);

    if (!patient) {
      console.error('Patient not found');
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    console.log('=== API: Patient Retrieval Complete ===');
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error in GET /api/patients/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('=== API: DELETE /api/patients/[id] ===');
  console.log('Patient ID:', params.id);

  try {
    await db.deletePatient(params.id);
    console.log('Patient deleted successfully');
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete patient' },
      { status: 500 }
    );
  }
} 