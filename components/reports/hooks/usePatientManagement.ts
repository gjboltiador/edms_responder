import { useState } from 'react';
import { Patient } from '../types';
import { toast } from "@/components/ui/use-toast";

export const usePatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    setIsAddPatientDialogOpen(false);
    toast({
      title: "Patient Added",
      description: "New patient has been added successfully.",
    });
  };

  const handleEditPatient = (updatedPatient: Patient) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
    setIsEditPatientDialogOpen(false);
    toast({
      title: "Patient Updated",
      description: "Patient information has been updated successfully.",
    });
  };

  const handleDeletePatient = async (patientId: string, fetchPatients?: () => Promise<void>) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      if (fetchPatients) {
        await fetchPatients();
      } else {
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
      }
      toast({
        title: "Patient Deleted",
        description: "Patient has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditPatientDialogOpen(true);
  };

  return {
    patients,
    selectedPatient,
    isAddPatientDialogOpen,
    isEditPatientDialogOpen,
    setPatients,
    setSelectedPatient,
    setIsAddPatientDialogOpen,
    setIsEditPatientDialogOpen,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
    openEditDialog,
  };
}; 