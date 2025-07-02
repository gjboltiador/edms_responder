import { CheckedState } from '@radix-ui/react-checkbox';

export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
  address: string;
  contactNumber: string;
  contactPerson: string;
  incidentId?: string;
  
  // Diagnostic fields
  chiefComplaint?: string;
  pertinentSymptoms?: string;
  allergies?: string;
  currentMedications?: string;
  pastMedicalHistory?: string;
  lastOralIntake?: string;
  historyOfPresentIllness?: string;
  
  // Vital signs
  vitalSigns?: {
    bloodPressure?: string;
    pulseRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
  };

  // Trauma assessment fields
  mechanismOfInjury?: string;
  traumaScore?: string;
  bodyRegionAssessment?: string;
  traumaInterventions?: string;
  causeOfInjuries?: string;
  typesOfInjuries?: string;
  locationOfIncident?: string;
  
  // Patient status
  patientStatus?: {
    conscious?: boolean;
    unconscious?: boolean;
    deceased?: boolean;
    verbal?: boolean;
    pain?: boolean;
    alert?: boolean;
    lethargic?: boolean;
    obtunded?: boolean;
    stupor?: boolean;
  };

  // Management fields
  management?: {
    firstAidDressing?: CheckedState;
    splinting?: CheckedState;
    ambuBagging?: CheckedState;
    oxygenTherapy?: CheckedState;
    oxygenLitersPerMin?: string;
    cpr?: CheckedState;
    cprStarted?: string;
    cprEnded?: string;
    aed?: CheckedState;
    medicationsGiven?: CheckedState;
    medicationsSpecify?: string;
    others?: CheckedState;
    othersSpecify?: string;
    headImmobilization?: CheckedState;
    controlBleeding?: CheckedState;
    ked?: CheckedState;
  };
  
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
} 