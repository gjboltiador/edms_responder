import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PatientForm } from "./forms/PatientForm";
import { Patient } from "@/types/patient";
import { Alert } from "@/types/alert";
import { useState } from "react";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Partial<Patient>) => void;
  selectedAlert: Alert;
  patient: Patient;
}

export function EditPatientModal({ isOpen, onClose, onSubmit, selectedAlert, patient }: EditPatientModalProps) {
  const [isDiagnosticUpdate, setIsDiagnosticUpdate] = useState(false);

  // Format the date and time from the alert
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSubmit = (updatedPatient: Partial<Patient>) => {
    // Check if this is a diagnostic update
    const isDiagnostic = updatedPatient.chiefComplaint !== undefined || 
                        updatedPatient.pertinentSymptoms !== undefined ||
                        updatedPatient.allergies !== undefined ||
                        updatedPatient.currentMedications !== undefined ||
                        updatedPatient.pastMedicalHistory !== undefined ||
                        updatedPatient.lastOralIntake !== undefined ||
                        updatedPatient.historyOfPresentIllness !== undefined;

    if (isDiagnostic) {
      setIsDiagnosticUpdate(true);
    }

    onSubmit({
      ...updatedPatient,
      id: patient.id,
      updatedAt: new Date().toISOString(),
    });

    // Only close the modal if it's not a diagnostic update
    if (!isDiagnostic) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            Edit Patient - {selectedAlert.type} Incident
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {formatDateTime(selectedAlert.created_at)}
            </span>
          </DialogTitle>
          {patient?.id && (
            <div className="text-xs text-gray-500 mt-1">ID: {patient.id}</div>
          )}
          <DialogDescription className="text-sm text-muted-foreground">
            Update the patient's information for the {selectedAlert.type.toLowerCase()} incident report.
          </DialogDescription>
        </DialogHeader>
        
        <PatientForm
          patient={patient}
          selectedAlert={selectedAlert}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 