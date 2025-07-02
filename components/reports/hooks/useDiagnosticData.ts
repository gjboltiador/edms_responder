import { useState } from 'react';
import { Patient } from '@/types/patient';
import { toast } from "@/components/ui/use-toast";

interface DiagnosticData {
  chiefComplaint?: string;
  pertinentSymptoms?: string;
  allergies?: string;
  currentMedications?: string;
  pastMedicalHistory?: string;
  lastOralIntake?: string;
  historyOfPresentIllness?: string;
  vitalSigns?: {
    bloodPressure?: string;
    pulseRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
  };
}

export const useDiagnosticData = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDiagnosticData = async (patientId: string, diagnosticData: DiagnosticData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/diagnostic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save diagnostic data');
      }

      toast({
        title: "Diagnostic Data Saved",
        description: "Patient's diagnostic information has been updated successfully.",
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save diagnostic data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    saveDiagnosticData,
  };
}; 