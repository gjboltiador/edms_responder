import { Patient } from '@/types/patient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dispatch, SetStateAction } from 'react';
import { ValidationErrors } from '@/types/validation';

interface DiagnosticFormProps {
  patientFormData: Partial<Patient>;
  setPatientFormData: Dispatch<SetStateAction<Partial<Patient>>>;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}

type VitalSignsKey = keyof NonNullable<Patient['vitalSigns']>;

export function DiagnosticForm({
  patientFormData,
  setPatientFormData,
  validationErrors,
  setValidationErrors,
}: DiagnosticFormProps) {
  const handleInputChange = (field: keyof Patient, value: string) => {
    setPatientFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleVitalSignsChange = (field: VitalSignsKey, value: string) => {
    setPatientFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...(prev.vitalSigns || {
          bloodPressure: '',
          pulseRate: '',
          respiratoryRate: '',
          temperature: '',
          oxygenSaturation: '',
        }),
        [field]: value,
      },
    }));

    // Clear individual vital sign error when changed
    if (validationErrors.vitalSigns && typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns !== null && (validationErrors.vitalSigns as Record<string, string>)[field]) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        vitalSigns: {
          ...(prevErrors.vitalSigns as Record<string, string>),
          [field]: undefined,
        },
      }));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="chiefComplaint" className="text-sm text-muted-foreground">Chief complaint</Label>
          <Input
            id="chiefComplaint"
            value={patientFormData.chiefComplaint || ''}
            onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
            placeholder="Enter chief complaint"
            className={`w-full ${validationErrors.chiefComplaint ? 'border-red-500' : ''}`}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pertinentSymptoms" className="text-sm text-muted-foreground">Pertinent symptoms</Label>
          <Input
            id="pertinentSymptoms"
            value={patientFormData.pertinentSymptoms || ''}
            onChange={(e) => handleInputChange('pertinentSymptoms', e.target.value)}
            placeholder="Enter pertinent symptoms"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="allergies" className="text-sm text-muted-foreground">Allergies</Label>
          <Input
            id="allergies"
            value={patientFormData.allergies || ''}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder="Enter allergies"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currentMedications" className="text-sm text-muted-foreground">Current medications</Label>
          <Input
            id="currentMedications"
            value={patientFormData.currentMedications || ''}
            onChange={(e) => handleInputChange('currentMedications', e.target.value)}
            placeholder="Enter current medications"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pastMedicalHistory" className="text-sm text-muted-foreground">Past medical history</Label>
          <Input
            id="pastMedicalHistory"
            value={patientFormData.pastMedicalHistory || ''}
            onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
            placeholder="Enter past medical history"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastOralIntake" className="text-sm text-muted-foreground">Last oral intake</Label>
          <Input
            id="lastOralIntake"
            value={patientFormData.lastOralIntake || ''}
            onChange={(e) => handleInputChange('lastOralIntake', e.target.value)}
            placeholder="Enter last oral intake"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="historyOfPresentIllness" className="text-sm text-muted-foreground">History of present illness</Label>
          <Input
            id="historyOfPresentIllness"
            value={patientFormData.historyOfPresentIllness || ''}
            onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
            placeholder="Enter history of present illness"
            className="w-full"
          />
        </div>
      </div>
      <h4 className="text-base font-semibold">VITAL SIGNS: <span className="text-red-500">*</span></h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bloodPressure" className="text-sm text-muted-foreground">BP (mmHg) <span className="text-red-500">*</span></Label>
          <Input
            id="bloodPressure"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={patientFormData.vitalSigns?.bloodPressure || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleVitalSignsChange('bloodPressure', value);
              }
            }}
            placeholder="Enter BP"
            className={`w-full text-sm placeholder:text-xs ${typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns?.bloodPressure ? 'border-red-500' : ''}`}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pulseRate" className="text-sm text-muted-foreground">PR (bpm) <span className="text-red-500">*</span></Label>
          <Input
            id="pulseRate"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={patientFormData.vitalSigns?.pulseRate || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleVitalSignsChange('pulseRate', value);
              }
            }}
            placeholder="Enter PR"
            className={`w-full text-sm placeholder:text-xs ${typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns?.pulseRate ? 'border-red-500' : ''}`}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="respiratoryRate" className="text-sm text-muted-foreground">RR (breaths/min) <span className="text-red-500">*</span></Label>
          <Input
            id="respiratoryRate"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={patientFormData.vitalSigns?.respiratoryRate || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleVitalSignsChange('respiratoryRate', value);
              }
            }}
            placeholder="Enter RR"
            className={`w-full text-sm placeholder:text-xs ${typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns?.respiratoryRate ? 'border-red-500' : ''}`}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="temperature" className="text-sm text-muted-foreground">Temp (°C) <span className="text-red-500">*</span></Label>
          <Input
            id="temperature"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={patientFormData.vitalSigns?.temperature || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleVitalSignsChange('temperature', value);
              }
            }}
            placeholder="Enter temp"
            className={`w-full text-sm placeholder:text-xs ${typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns?.temperature ? 'border-red-500' : ''}`}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oxygenSaturation" className="text-sm text-muted-foreground">O2 Sat (%) <span className="text-red-500">*</span></Label>
          <Input
            id="oxygenSaturation"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={patientFormData.vitalSigns?.oxygenSaturation || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleVitalSignsChange('oxygenSaturation', value);
              }
            }}
            placeholder="Enter O2 Sat"
            className={`w-full text-sm placeholder:text-xs ${typeof validationErrors.vitalSigns === 'object' && validationErrors.vitalSigns?.oxygenSaturation ? 'border-red-500' : ''}`}
            required
          />
        </div>
      </div>
    </div>
  );
} 