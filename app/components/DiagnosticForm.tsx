import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DiagnosticFormProps {
  patient: {
    id: string;
    name: string;
    chiefComplaint?: string;
    pertinentSymptoms?: string;
    allergies?: string;
    currentMedications?: string;
    pastMedicalHistory?: string;
    lastOralIntake?: string;
    historyOfPresentIllness?: string;
  };
  onUpdate: (data: any) => void;
}

export function DiagnosticForm({ patient, onUpdate }: DiagnosticFormProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnostic Information</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Patient ID:</span> {patient.id}
          </div>
          <div>
            <span className="font-medium">Name:</span> {patient.name}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chiefComplaint">Chief Complaint</Label>
          <Input
            id="chiefComplaint"
            value={patient.chiefComplaint || ''}
            onChange={(e) => handleChange('chiefComplaint', e.target.value)}
            placeholder="Enter chief complaint"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pertinentSymptoms">Pertinent Symptoms</Label>
          <Textarea
            id="pertinentSymptoms"
            value={patient.pertinentSymptoms || ''}
            onChange={(e) => handleChange('pertinentSymptoms', e.target.value)}
            placeholder="Enter pertinent symptoms"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={patient.allergies || ''}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="Enter allergies"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Input
              id="currentMedications"
              value={patient.currentMedications || ''}
              onChange={(e) => handleChange('currentMedications', e.target.value)}
              placeholder="Enter current medications"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
          <Textarea
            id="pastMedicalHistory"
            value={patient.pastMedicalHistory || ''}
            onChange={(e) => handleChange('pastMedicalHistory', e.target.value)}
            placeholder="Enter past medical history"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastOralIntake">Last Oral Intake</Label>
          <Input
            id="lastOralIntake"
            value={patient.lastOralIntake || ''}
            onChange={(e) => handleChange('lastOralIntake', e.target.value)}
            placeholder="Enter last oral intake"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
          <Textarea
            id="historyOfPresentIllness"
            value={patient.historyOfPresentIllness || ''}
            onChange={(e) => handleChange('historyOfPresentIllness', e.target.value)}
            placeholder="Enter history of present illness"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
} 