import { Patient as BasePatient } from '@/types/patient';

export interface Alert {
  id: number;
  type: string;
  location: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

export type Patient = BasePatient;

export interface ReportScreenProps {
  selectedAlert: Alert | null;
} 