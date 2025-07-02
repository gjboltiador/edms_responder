import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from '@/types/alert';
import { DiagnosticForm } from '@/components/reports/forms/DiagnosticForm';
import { TraumaSheetForm } from '@/components/reports/forms/TraumaSheetForm';
import { ValidationErrors } from '@/types/validation';
import { toast } from "@/components/ui/use-toast";
import { useDiagnosticData } from '../hooks/useDiagnosticData';

interface PatientFormProps {
  patient: Partial<Patient>;
  onSubmit: (patient: Partial<Patient>) => void;
  onCancel: () => void;
  selectedAlert?: Alert;
}

export function PatientForm({ patient, onSubmit, onCancel, selectedAlert }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientFormData, setPatientFormData] = useState<Partial<Patient>>(patient);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [savedPatient, setSavedPatient] = useState<Patient | null>(null);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const { isSubmitting: isDiagnosticSubmitting, error: diagnosticError, saveDiagnosticData } = useDiagnosticData();

  useEffect(() => {
    setPatientFormData(patient);
  }, [patient]);

  useEffect(() => {
    if (activeTab === "basic" && savedPatient) {
      // Create a new object with all the basic patient information
      const basicInfo = {
        name: savedPatient.name || '',
        age: savedPatient.age || '',
        gender: savedPatient.gender || '',
        address: savedPatient.address || '',
        contactNumber: savedPatient.contactNumber || '',
        contactPerson: savedPatient.contactPerson || '',
        incidentId: savedPatient.incidentId
      };

      // Update the form data with the basic information
      setPatientFormData(prevData => ({
        ...prevData,
        ...basicInfo
      }));
    }
  }, [activeTab, savedPatient]);

  useEffect(() => {
    if (patient && patient.id) {
      setSavedPatient(patient as Patient);
    }
  }, [patient]);

  const handleFieldChange = (field: keyof Patient, value: any) => {
    setPatientFormData(prev => ({
      ...prev,

      [field]: value

    }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateBasicInfo = () => {
    const errors: ValidationErrors = {};
    const requiredFields: (keyof Patient)[] = [
      'name',
      'age',
      'gender',
      'address',
      'contactNumber',
      'contactPerson'
    ];

    requiredFields.forEach(field => {
      if (!patientFormData[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Validate age is a number
    if (patientFormData.age && isNaN(Number(patientFormData.age))) {
      errors.age = 'Age must be a number';
    }

    // Validate contact number format
    if (patientFormData.contactNumber && !/^\d{11}$/.test(patientFormData.contactNumber)) {
      errors.contactNumber = 'Contact number must be 11 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBasicInfo()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Add incident_id from selectedAlert if available
      const patientData = {
        ...patientFormData,
        incidentId: selectedAlert?.id
      };

      // Determine if this is a new patient or an update
      const isUpdate = Boolean(patientData.id && patientData.id.trim() !== '');
      const url = isUpdate ? `/api/patients/${patientData.id}` : '/api/patients';
      const method = isUpdate ? 'PUT' : 'POST';

      // Save to database through API
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || `Failed to ${isUpdate ? 'update' : 'save'} patient`);
      }

      const savedPatient = await response.json();
      setSavedPatient(savedPatient);
      
      // Show success toast
      toast({
        title: `Patient ${isUpdate ? 'Updated' : 'Saved'} Successfully`,
        description: `Patient ID: ${savedPatient.id}`,
      });

      // Call the parent onSubmit with the saved patient data
      onSubmit(savedPatient);

      // Switch to Diagnostic tab after successful save
      setActiveTab("diagnostic");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save patient information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiagnosticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      if (!savedPatient?.id) {
        throw new Error('Please save patient information first');
      }

      // Extract only diagnostic-related data
      const diagnosticData = {
        chiefComplaint: patientFormData.chiefComplaint,
        pertinentSymptoms: patientFormData.pertinentSymptoms,
        allergies: patientFormData.allergies,
        currentMedications: patientFormData.currentMedications,
        pastMedicalHistory: patientFormData.pastMedicalHistory,
        lastOralIntake: patientFormData.lastOralIntake,
        historyOfPresentIllness: patientFormData.historyOfPresentIllness,
        vitalSigns: patientFormData.vitalSigns
      };

      const updatedPatient = await saveDiagnosticData(savedPatient.id, diagnosticData);
      
      // Store the diagnostic ID
      if (updatedPatient.diagnosticId) {
        setDiagnosticId(updatedPatient.diagnosticId);
      }
      
      onSubmit(updatedPatient);
      setActiveTab("trauma");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save diagnostic information. Please try again.');
    }
  };

  const handleTraumaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!savedPatient?.id) {
        throw new Error('Please save patient information first');
      }

      // Extract trauma-related data
      const traumaData = {
        causeOfInjuries: patientFormData.causeOfInjuries,
        typesOfInjuries: patientFormData.typesOfInjuries,
        locationOfIncident: patientFormData.locationOfIncident,
        remarks: patientFormData.remarks,
        patientStatus: patientFormData.patientStatus,
        management: patientFormData.management
      };

      // Save trauma data to API
      const response = await fetch(`/api/patients/${savedPatient.id}/trauma`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traumaData),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to save trauma information');
      }

      const updatedTrauma = await response.json();
      
      // Show success toast
      toast({
        title: "Trauma Information Saved",
        description: "Patient trauma information has been saved successfully.",
      });

      // Call the parent onSubmit with the updated patient data
      onSubmit({
        ...patientFormData,
        ...updatedTrauma
      });

      // Close the modal by calling onCancel
      onCancel();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save trauma information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Patient</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="trauma">Trauma Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
            <p className="text-sm text-muted-foreground">
              Enter patient's basic information and contact details for identification and follow-up.
            </p>
            {patientFormData.id && (
              <div className="text-xs text-gray-500 mb-4">ID: {patientFormData.id}</div>
            )}
          </div>
          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm text-muted-foreground">
                  Patient's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={patientFormData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter patient's name"
                  className={`w-full ${validationErrors.name ? 'border-red-500' : ''}`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-sm text-muted-foreground">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={patientFormData.age || ''}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  placeholder="Enter patient's age"
                  className={`w-full ${validationErrors.age ? 'border-red-500' : ''}`}
                />
                {validationErrors.age && (
                  <p className="text-sm text-red-500">{validationErrors.age}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-sm text-muted-foreground">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <select
                  id="gender"
                  value={patientFormData.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className={`w-full p-2 border rounded-md ${validationErrors.gender ? 'border-red-500' : 'border-input'}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {validationErrors.gender && (
                  <p className="text-sm text-red-500">{validationErrors.gender}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm text-muted-foreground">
                  Address <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="address"
                  value={patientFormData.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Enter patient's address"
                  className={`w-full min-h-[80px] p-2 border rounded-md ${validationErrors.address ? 'border-red-500' : 'border-input'}`}
                />
                {validationErrors.address && (
                  <p className="text-sm text-red-500">{validationErrors.address}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactNumber" className="text-sm text-muted-foreground">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={patientFormData.contactNumber || ''}
                  onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  className={`w-full ${validationErrors.contactNumber ? 'border-red-500' : ''}`}
                />
                {validationErrors.contactNumber && (
                  <p className="text-sm text-red-500">{validationErrors.contactNumber}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-sm text-muted-foreground">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  value={patientFormData.contactPerson || ''}
                  onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                  placeholder="Enter contact person's name"
                  className={`w-full ${validationErrors.contactPerson ? 'border-red-500' : ''}`}
                />
                {validationErrors.contactPerson && (
                  <p className="text-sm text-red-500">{validationErrors.contactPerson}</p>
                )}
              </div>
            </div>

            {submitError && (
              <p className={`text-sm ${submitError.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {submitError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (patient && patient.id ? 'Update Patient Info' : 'Save Patient Info')}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Diagnostic Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter patient's diagnostic information and medical history.
            </p>
            {savedPatient && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Patient ID:</span> {savedPatient.id}
                </p>
                <p className="text-sm text-green-700">
                  <span className="font-medium">Name:</span> {savedPatient.name}
                </p>
                {diagnosticId && (
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Diagnostic ID:</span> {diagnosticId}
                  </p>
                )}
              </div>
            )}
          </div>
          <form onSubmit={handleDiagnosticSubmit} className="space-y-4">
            <DiagnosticForm
              patientFormData={patientFormData}
              setPatientFormData={setPatientFormData}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
            />
            {(submitError || diagnosticError) && (
              <p className="text-sm text-red-500">
                {submitError || diagnosticError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isDiagnosticSubmitting || !savedPatient}>
                {isDiagnosticSubmitting ? 'Saving...' : (patient && patient.id ? 'Update Diagnostic Info' : 'Save Diagnostic Info')}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="trauma" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Trauma Sheet</h3>
            <p className="text-sm text-muted-foreground">
              Enter patient's trauma assessment and management information.
            </p>
            {diagnosticId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Diagnostic ID:</span> {diagnosticId}
                </p>
              </div>
            )}
          </div>
          <form onSubmit={handleTraumaSubmit} className="space-y-4">
            <TraumaSheetForm
              patientFormData={patientFormData}
              setPatientFormData={setPatientFormData}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
            />
            {submitError && (
              <p className="text-sm text-red-500">
                {submitError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (patient && patient.id ? 'Update Trauma Info' : 'Save Trauma Info')}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
