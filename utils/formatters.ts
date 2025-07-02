import { format } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatTime = (time: string | Date): string => {
  return format(new Date(time), 'hh:mm a');
};

export const formatDateTime = (dateTime: string | Date): string => {
  return format(new Date(dateTime), 'MMM dd, yyyy hh:mm a');
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
};

export const formatAddress = (address: string): string => {
  return address
    .split(',')
    .map(part => part.trim())
    .join(', ');
};

export const formatVitalSigns = (vitalSigns: {
  bloodPressure: string;
  pulseRate: string;
  respiratoryRate: string;
  temperature: string;
  oxygenSaturation: string;
}): string => {
  const parts = [];
  if (vitalSigns.bloodPressure) parts.push(`BP: ${vitalSigns.bloodPressure}`);
  if (vitalSigns.pulseRate) parts.push(`HR: ${vitalSigns.pulseRate}`);
  if (vitalSigns.respiratoryRate) parts.push(`RR: ${vitalSigns.respiratoryRate}`);
  if (vitalSigns.temperature) parts.push(`Temp: ${vitalSigns.temperature}`);
  if (vitalSigns.oxygenSaturation) parts.push(`O2: ${vitalSigns.oxygenSaturation}`);
  return parts.join(' | ');
}; 