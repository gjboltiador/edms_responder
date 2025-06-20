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
  responder_id?: number;
  responder_name?: string;
  responder_username?: string;
  assigned_at?: string;
}

export type Patient = BasePatient;

export interface ReportScreenProps {
  selectedAlert: Alert | null;
  setSelectedAlert: (alert: Alert | null) => void;
} 