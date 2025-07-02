import { Patient } from '@/types/patient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Wind, Thermometer, Droplet, Pencil, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onView: (patient: Patient) => void;
}

// Helper function to generate unique keys with validation
const generateKey = (prefix: string, id: string | undefined, suffix?: string) => {
  if (!id) {
    console.warn(`Missing ID for ${prefix}${suffix ? `-${suffix}` : ''}`);
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}${suffix ? `-${suffix}` : ''}`;
  }
  return `${prefix}-${id}${suffix ? `-${suffix}` : ''}`;
};

// Status Badge Component
const StatusBadge = ({ patient, status, className }: { patient: Patient; status: keyof NonNullable<Patient['patientStatus']>; className: string }) => {
  const statusConfig = {
    unconscious: { label: 'Unconscious', className: 'bg-red-100 text-red-800 border border-red-200' },
    deceased: { label: 'Deceased', className: 'bg-gray-100 text-gray-800 border border-gray-200' },
    alert: { label: 'Alert', className: 'bg-green-100 text-green-800 border border-green-200' },
    pain: { label: 'Pain', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
    verbal: { label: 'Verbal', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    lethargic: { label: 'Lethargic', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
    obtunded: { label: 'Obtunded', className: 'bg-rose-100 text-rose-800 border border-rose-200' },
    stupor: { label: 'Stupor', className: 'bg-slate-100 text-slate-800 border border-slate-200' },
    conscious: { label: 'Conscious', className: 'bg-green-100 text-green-800 border border-green-200' },
  };

  const config = statusConfig[status];
  if (!patient.patientStatus?.[status]) return null;

  return (
    <span
      key={generateKey('status', patient.id, status)}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

// Vital Sign Component
const VitalSign = ({ patient, type, icon: Icon, label, value, className }: { 
  patient: Patient; 
  type: keyof NonNullable<Patient['vitalSigns']>;
  icon: React.ElementType;
  label: string;
  value: string | number;
  className: string;
}) => {
  const vitalValue = patient.vitalSigns?.[type] ?? 'N/A';
  
  return (
    <div key={generateKey('vitals', patient.id, type)} className="flex items-center gap-1 p-0 bg-transparent border-none">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <span className="text-xs font-medium">{label}:</span>
      <span className="text-xs font-semibold text-gray-900 ml-0.5">{vitalValue}</span>
    </div>
  );
};

// Management Badge Component
const ManagementBadge = ({ patient, type, className }: { 
  patient: Patient; 
  type: keyof NonNullable<Patient['management']>;
  className: string;
}) => {
  if (patient.management?.[type] !== true) return null;
  
  const badgeConfig: Record<string, { label: string; className: string }> = {
    firstAidDressing: { label: 'First Aid Dressing', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
    splinting: { label: 'Splinting', className: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
    oxygenTherapy: { label: 'Oxygen Therapy', className: 'bg-cyan-100 text-cyan-800 border border-cyan-200' },
    cpr: { label: 'CPR', className: 'bg-red-100 text-red-800 border border-red-200' },
    aed: { label: 'AED', className: 'bg-rose-100 text-rose-800 border border-rose-200' },
    ambuBagging: { label: 'Ambu Bagging', className: 'bg-purple-100 text-purple-800 border border-purple-200' },
    medicationsGiven: { label: 'Medications Given', className: 'bg-pink-100 text-pink-800 border border-pink-200' },
    headImmobilization: { label: 'Head Immobilization', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    controlBleeding: { label: 'Control Bleeding', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
    ked: { label: 'KED', className: 'bg-teal-100 text-teal-800 border border-teal-200' },
  };
  
  const config = badgeConfig[type] ?? { label: type, className: 'bg-gray-100 text-gray-800 border border-gray-200' };
  
  return (
    <span
      key={generateKey('management', patient.id, type)}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export function PatientList({ patients, onEdit, onDelete, onView }: PatientListProps) {
  // Validate patients array
  if (!Array.isArray(patients)) {
    console.error('Patients prop is not an array:', patients);
    return null;
  }

  // Filter out invalid patients
  const validPatients = patients.filter(patient => {
    if (!patient || typeof patient !== 'object') {
      console.warn('Invalid patient object:', patient);
      return false;
    }
    return true;
  });

  if (validPatients.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/50">
        <p className="text-sm text-muted-foreground">No valid patients to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map((patient) => (
        <Card
          key={`patient-${patient.id}`}
          className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => onView(patient)}
        >
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{patient.name}</h3>
                  <p className="text-xs text-gray-600">
                    {patient.age} years • {patient.gender}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <div className="flex gap-1.5">
                  <Button
                    key={generateKey('action', patient.id, 'edit')}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    onClick={e => { e.stopPropagation(); onEdit(patient); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    key={generateKey('action', patient.id, 'delete')}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this patient and all related data? This action cannot be undone.')) {
                        onDelete(patient.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Status row OUTSIDE the grid, styled like management */}
            <div className="mb-2">
              <div className="text-xs text-gray-500 font-medium mb-1">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {patient.patientStatus?.conscious && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'conscious')}
                    patient={patient}
                    status="conscious"
                    className=""
                  />
                )}
                {patient.patientStatus?.unconscious && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'unconscious')}
                    patient={patient}
                    status="unconscious"
                    className=""
                  />
                )}
                {patient.patientStatus?.deceased && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'deceased')}
                    patient={patient}
                    status="deceased"
                    className=""
                  />
                )}
                {patient.patientStatus?.verbal && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'verbal')}
                    patient={patient}
                    status="verbal"
                    className=""
                  />
                )}
                {patient.patientStatus?.pain && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'pain')}
                    patient={patient}
                    status="pain"
                    className=""
                  />
                )}
                {patient.patientStatus?.alert && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'alert')}
                    patient={patient}
                    status="alert"
                    className=""
                  />
                )}
                {patient.patientStatus?.lethargic && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'lethargic')}
                    patient={patient}
                    status="lethargic"
                    className=""
                  />
                )}
                {patient.patientStatus?.obtunded && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'obtunded')}
                    patient={patient}
                    status="obtunded"
                    className=""
                  />
                )}
                {patient.patientStatus?.stupor && (
                  <StatusBadge
                    key={generateKey('status', patient.id, 'stupor')}
                    patient={patient}
                    status="stupor"
                    className=""
                  />
                )}
              </div>
            </div>
            {/* The rest of the card content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-1 md:col-span-3">
                <div className="text-xs text-gray-500 font-medium mb-1">Vital Signs</div>
                <div className="flex flex-wrap gap-2">
                  <VitalSign key={generateKey('vitals', patient.id, 'bloodPressure')} patient={patient} type="bloodPressure" icon={Activity} label="BP" value={patient.vitalSigns?.bloodPressure ?? 'N/A'} className="bg-white text-blue-700 border border-blue-100" />
                  <VitalSign key={generateKey('vitals', patient.id, 'pulseRate')} patient={patient} type="pulseRate" icon={Heart} label="PR" value={patient.vitalSigns?.pulseRate ?? 'N/A'} className="bg-white text-purple-700 border border-purple-100" />
                  <VitalSign key={generateKey('vitals', patient.id, 'respiratoryRate')} patient={patient} type="respiratoryRate" icon={Wind} label="RR" value={patient.vitalSigns?.respiratoryRate ?? 'N/A'} className="bg-white text-indigo-700 border border-indigo-100" />
                  <VitalSign key={generateKey('vitals', patient.id, 'temperature')} patient={patient} type="temperature" icon={Thermometer} label="Temp" value={patient.vitalSigns?.temperature ?? 'N/A'} className="bg-white text-pink-700 border border-pink-100" />
                  <VitalSign key={generateKey('vitals', patient.id, 'oxygenSaturation')} patient={patient} type="oxygenSaturation" icon={Droplet} label="O2" value={patient.vitalSigns?.oxygenSaturation ?? 'N/A'} className="bg-white text-cyan-700 border border-cyan-100" />
                </div>
              </div>
              <div className="col-span-1 md:col-span-3">
                <div className="text-xs text-gray-500 font-medium mb-1">Management</div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.management?.firstAidDressing && (
                    <ManagementBadge key={generateKey('management', patient.id, 'firstAidDressing')} patient={patient} type="firstAidDressing" className="" />
                  )}
                  {patient.management?.splinting && (
                    <ManagementBadge key={generateKey('management', patient.id, 'splinting')} patient={patient} type="splinting" className="" />
                  )}
                  {patient.management?.oxygenTherapy && (
                    <ManagementBadge key={generateKey('management', patient.id, 'oxygenTherapy')} patient={patient} type="oxygenTherapy" className="" />
                  )}
                  {patient.management?.cpr && (
                    <ManagementBadge key={generateKey('management', patient.id, 'cpr')} patient={patient} type="cpr" className="" />
                  )}
                  {patient.management?.aed && (
                    <ManagementBadge key={generateKey('management', patient.id, 'aed')} patient={patient} type="aed" className="" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 