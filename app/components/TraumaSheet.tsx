import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface TraumaSheetProps {
  patient: {
    id: string;
    name: string;
    diagnosticId?: string;
    causeOfInjuries?: string;
    typesOfInjuries?: string;
    locationOfIncident?: string;
    remarks?: string;
  };
  onUpdate: (data: any) => void;
}

export function TraumaSheet({ patient, onUpdate }: TraumaSheetProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trauma Sheet</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Patient ID:</span> {patient.id}
          </div>
          <div>
            <span className="font-medium">Name:</span> {patient.name}
          </div>
          {patient.diagnosticId && (
            <div>
              <span className="font-medium">Diagnostic ID:</span> {patient.diagnosticId}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="causeOfInjuries">Cause of Injuries</Label>
            <Input
              id="causeOfInjuries"
              value={patient.causeOfInjuries || ''}
              onChange={(e) => handleChange('causeOfInjuries', e.target.value)}
              placeholder="Enter cause of injuries"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="typesOfInjuries">Types of Injuries</Label>
            <Input
              id="typesOfInjuries"
              value={patient.typesOfInjuries || ''}
              onChange={(e) => handleChange('typesOfInjuries', e.target.value)}
              placeholder="Enter types of injuries"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationOfIncident">Location of Incident</Label>
          <Input
            id="locationOfIncident"
            value={patient.locationOfIncident || ''}
            onChange={(e) => handleChange('locationOfIncident', e.target.value)}
            placeholder="Enter location of incident"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={patient.remarks || ''}
            onChange={(e) => handleChange('remarks', e.target.value)}
            placeholder="Enter any additional remarks"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
} 