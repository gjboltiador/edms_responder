import { Patient } from '@/types/patient';
import { ValidationErrors } from '@/types/validation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

interface TraumaSheetFormProps {
  patientFormData: Partial<Patient>;
  setPatientFormData: (data: Partial<Patient>) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: (errors: ValidationErrors) => void;
}

type PatientStatusField = keyof NonNullable<Patient['patientStatus']>;
type ManagementField = keyof NonNullable<Patient['management']>;

export function TraumaSheetForm({
  patientFormData,
  setPatientFormData,
  validationErrors,
  setValidationErrors,
}: TraumaSheetFormProps) {
  const handleInputChange = (field: keyof Patient, value: string) => {
    setPatientFormData({
      ...patientFormData,
      [field]: value,
    });
    setValidationErrors({
      ...validationErrors,
      [field]: undefined,
    });
  };

  const handlePatientStatusChange = (statusField: PatientStatusField, checked: boolean) => {
    setPatientFormData({
      ...patientFormData,
      patientStatus: {
        ...(patientFormData.patientStatus || {}),
        [statusField]: checked,
      },
    });
    setValidationErrors({
      ...validationErrors,
      patientStatus: {
        ...(validationErrors.patientStatus || {}),
        [statusField]: undefined,
      },
    });
  };

  const handleManagementCheckboxChange = (field: ManagementField, checked: CheckedState) => {
    setPatientFormData({
      ...patientFormData,
      management: {
        ...(patientFormData.management || {}),
        [field]: checked,
      },
    });
    setValidationErrors({
      ...validationErrors,
      management: {
        ...(validationErrors.management || {}),
        [field]: undefined,
      },
    });
  };

  const handleManagementInputChange = (field: ManagementField, value: string) => {
    setPatientFormData({
      ...patientFormData,
      management: {
        ...(patientFormData.management || {}),
        [field]: value,
      },
    });
    setValidationErrors({
      ...validationErrors,
      management: {
        ...(validationErrors.management || {}),
        [field]: undefined,
      },
    });
  };

  const patientStatusErrors = validationErrors.patientStatus || {};
  const managementErrors = validationErrors.management || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="causeOfInjuries" className="text-sm text-muted-foreground">Cause of injuries/illness</Label>
          <Input
            id="causeOfInjuries"
            value={patientFormData.causeOfInjuries || ''}
            onChange={(e) => handleInputChange('causeOfInjuries', e.target.value)}
            placeholder="Describe the cause of injuries or illness"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="locationOfIncident" className="text-sm text-muted-foreground">Location of incident</Label>
          <Input
            id="locationOfIncident"
            value={patientFormData.locationOfIncident || ''}
            onChange={(e) => handleInputChange('locationOfIncident', e.target.value)}
            placeholder="Enter location of incident"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="typesOfInjuries" className="text-sm text-muted-foreground">Types of injuries</Label>
          <Input
            id="typesOfInjuries"
            value={patientFormData.typesOfInjuries || ''}
            onChange={(e) => handleInputChange('typesOfInjuries', e.target.value)}
            placeholder="Describe the types of injuries"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Patient status upon assessment:</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Conscious', field: 'conscious' as PatientStatusField },
              { label: 'Unconscious', field: 'unconscious' as PatientStatusField },
              { label: 'Deceased', field: 'deceased' as PatientStatusField },
              { label: 'Verbal', field: 'verbal' as PatientStatusField },
              { label: 'Pain', field: 'pain' as PatientStatusField },
              { label: 'Alert', field: 'alert' as PatientStatusField },
              { label: 'Lethargic', field: 'lethargic' as PatientStatusField },
              { label: 'Obtunded', field: 'obtunded' as PatientStatusField },
              { label: 'Stupor', field: 'stupor' as PatientStatusField },
            ].map((item) => (
              <div key={item.field} className="flex items-center space-x-2">
                <Checkbox
                  id={item.field}
                  checked={patientFormData.patientStatus?.[item.field] || false}
                  onCheckedChange={(checked) => handlePatientStatusChange(item.field, checked as boolean)}
                  className={`${patientStatusErrors[item.field] ? 'border-red-500' : ''}`}
                />
                <Label
                  htmlFor={item.field}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${patientStatusErrors[item.field] ? 'text-red-500' : ''}`}
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">MANAGEMENT DONE:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'First Aid Dressing & Bandaging', field: 'firstAidDressing' as ManagementField },
              { label: 'Splinting', field: 'splinting' as ManagementField },
              { label: 'Ambu Bagging', field: 'ambuBagging' as ManagementField },
              { label: 'AED', field: 'aed' as ManagementField },
              { label: 'Head Immobilization', field: 'headImmobilization' as ManagementField },
              { label: 'Control Bleeding', field: 'controlBleeding' as ManagementField },
              { label: 'KED', field: 'ked' as ManagementField },
            ].map((item) => (
              <div key={item.field} className="flex items-center space-x-2">
                <Checkbox
                  id={item.field}
                  checked={patientFormData.management?.[item.field] || false}
                  onCheckedChange={(checked) => handleManagementCheckboxChange(item.field, checked)}
                  className={`${managementErrors[item.field] ? 'border-red-500' : ''}`}
                />
                <Label
                  htmlFor={item.field}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${managementErrors[item.field] ? 'text-red-500' : ''}`}
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cpr"
                checked={patientFormData.management?.cpr || false}
                onCheckedChange={(checked) => handleManagementCheckboxChange('cpr', checked)}
                className={`${managementErrors.cpr ? 'border-red-500' : ''}`}
              />
              <Label
                htmlFor="cpr"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${managementErrors.cpr ? 'text-red-500' : ''}`}
              >
                CPR
              </Label>
            </div>
            {patientFormData.management?.cpr && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="cprStarted" className="text-sm text-muted-foreground">Time Started</Label>
                  <Input
                    id="cprStarted"
                    type="time"
                    value={patientFormData.management?.cprStarted || ''}
                    onChange={(e) => handleManagementInputChange('cprStarted', e.target.value)}
                    className={managementErrors.cprStarted ? 'border-red-500' : ''}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="cprEnded" className="text-sm text-muted-foreground">Time Ended</Label>
                  <Input
                    id="cprEnded"
                    type="time"
                    value={patientFormData.management?.cprEnded || ''}
                    onChange={(e) => handleManagementInputChange('cprEnded', e.target.value)}
                    className={managementErrors.cprEnded ? 'border-red-500' : ''}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oxygenTherapy"
                checked={patientFormData.management?.oxygenTherapy || false}
                onCheckedChange={(checked) => handleManagementCheckboxChange('oxygenTherapy', checked)}
                className={`${managementErrors.oxygenTherapy ? 'border-red-500' : ''}`}
              />
              <Label
                htmlFor="oxygenTherapy"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${managementErrors.oxygenTherapy ? 'text-red-500' : ''}`}
              >
                Oxygen Therapy
              </Label>
            </div>
            {patientFormData.management?.oxygenTherapy && (
              <Input
                id="oxygenLitersPerMin"
                value={patientFormData.management?.oxygenLitersPerMin || ''}
                onChange={(e) => handleManagementInputChange('oxygenLitersPerMin', e.target.value)}
                placeholder="@ Liters/min"
                className={`mt-2 ${managementErrors.oxygenLitersPerMin ? 'border-red-500' : ''}`}
              />
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicationsGiven"
                checked={patientFormData.management?.medicationsGiven || false}
                onCheckedChange={(checked) => handleManagementCheckboxChange('medicationsGiven', checked)}
                className={`${managementErrors.medicationsGiven ? 'border-red-500' : ''}`}
              />
              <Label
                htmlFor="medicationsGiven"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${managementErrors.medicationsGiven ? 'text-red-500' : ''}`}
              >
                Medications Given/Assisted With
              </Label>
            </div>
            {patientFormData.management?.medicationsGiven && (
              <Textarea
                id="medicationsSpecify"
                value={patientFormData.management?.medicationsSpecify || ''}
                onChange={(e) => handleManagementInputChange('medicationsSpecify', e.target.value)}
                placeholder="Specify medications given"
                className={`mt-2 ${managementErrors.medicationsSpecify ? 'border-red-500' : ''}`}
                rows={3}
              />
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="others"
                checked={patientFormData.management?.others || false}
                onCheckedChange={(checked) => handleManagementCheckboxChange('others', checked)}
                className={`${managementErrors.others ? 'border-red-500' : ''}`}
              />
              <Label
                htmlFor="others"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${managementErrors.others ? 'text-red-500' : ''}`}
              >
                OTHERS (specify)
              </Label>
            </div>
            {patientFormData.management?.others && (
              <Textarea
                id="othersSpecify"
                value={patientFormData.management?.othersSpecify || ''}
                onChange={(e) => handleManagementInputChange('othersSpecify', e.target.value)}
                placeholder="Specify other management done"
                className={`mt-2 ${managementErrors.othersSpecify ? 'border-red-500' : ''}`}
                rows={3}
              />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="remarks" className="text-sm text-muted-foreground">Remarks</Label>
          <Textarea
            id="remarks"
            value={patientFormData.remarks || ''}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            placeholder="Add any additional remarks"
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
} 