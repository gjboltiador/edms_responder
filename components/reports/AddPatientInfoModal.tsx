import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PatientForm } from "./forms/PatientForm";
import { Patient } from "@/types/patient";
import { Alert } from "@/types/alert";

interface AddPatientInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Patient) => void;
  selectedAlert: Alert;
}

export function AddPatientInfoModal({ isOpen, onClose, onSubmit, selectedAlert }: AddPatientInfoModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            Add New Patient - {selectedAlert.type} Incident
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {formatDateTime(selectedAlert.created_at)}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the basic patient information below.
          </DialogDescription>
        </DialogHeader>
        
        <PatientForm
          patient={{}}
          selectedAlert={selectedAlert}
          onSubmit={(newPatient) => {
            const patientWithId: Patient = {
              id: crypto.randomUUID(),
              name: newPatient.name || '',
              age: newPatient.age || '',
              gender: newPatient.gender || '',
              address: newPatient.address || '',
              contactNumber: newPatient.contactNumber || '',
              contactPerson: newPatient.contactPerson || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            onSubmit(patientWithId);
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 