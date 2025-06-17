import { useState, useCallback } from 'react';
import { Patient } from '@/types/patient';
import { patientService } from '@/services/api/patient';

export const usePatient = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newPatient = await patientService.createPatient(patient);
      setPatients(prev => [...prev, newPatient]);
      setError(null);
      return newPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, patient: Partial<Patient>) => {
    try {
      setLoading(true);
      const updatedPatient = await patientService.updatePatient(id, patient);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      setError(null);
      return updatedPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await patientService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    addPatient,
    updatePatient,
    deletePatient,
  };
}; 