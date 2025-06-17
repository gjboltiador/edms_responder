export interface ValidationErrors {
  [key: string]: string | undefined | {
    [key: string]: string | undefined;
  };
  name?: string;
  age?: string;
  gender?: string;
  address?: string;
  contactNumber?: string;
  contactPerson?: string;
  
  // Diagnostic fields (optional, not required for basic submission)
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
  patientStatus?: {
    conscious?: string;
    unconscious?: string;
    deceased?: string;
    verbal?: string;
    pain?: string;
    alert?: string;
    lethargic?: string;
    obtunded?: string;
    stupor?: string;
  };

  // Management fields
  management?: {
    firstAidDressing?: string;
    splinting?: string;
    ambuBagging?: string;
    oxygenTherapy?: string;
    oxygenLitersPerMin?: string;
    cprStarted?: string;
    cprEnded?: string;
    aed?: string;
    medicationsGiven?: string;
    others?: string;
    othersSpecify?: string;
    headImmobilization?: string;
    controlBleeding?: string;
    ked?: string;
  };
} 