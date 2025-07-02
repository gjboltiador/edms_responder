import { Patient } from '@/types/patient';
import { API_ENDPOINTS } from '@/constants/config';

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const response = await fetch(API_ENDPOINTS.PATIENTS);
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    return response.json();
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const response = await fetch(API_ENDPOINTS.PATIENTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });
    if (!response.ok) {
      throw new Error('Failed to create patient');
    }
    return response.json();
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });
    if (!response.ok) {
      throw new Error('Failed to update patient');
    }
    return response.json();
  },

  async deletePatient(id: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete patient');
    }
  },
}; 