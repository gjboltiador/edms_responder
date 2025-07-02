export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phoneNumber);
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidBloodPressure = (bp: string): boolean => {
  const bpRegex = /^\d{2,3}\/\d{2,3}$/;
  return bpRegex.test(bp);
};

export const isValidPulseRate = (rate: string): boolean => {
  const rateNum = parseInt(rate);
  return !isNaN(rateNum) && rateNum >= 0 && rateNum <= 250;
};

export const isValidRespiratoryRate = (rate: string): boolean => {
  const rateNum = parseInt(rate);
  return !isNaN(rateNum) && rateNum >= 0 && rateNum <= 60;
};

export const isValidTemperature = (temp: string): boolean => {
  const tempNum = parseFloat(temp);
  return !isNaN(tempNum) && tempNum >= 35 && tempNum <= 42;
};

export const isValidOxygenSaturation = (o2: string): boolean => {
  const o2Num = parseInt(o2);
  return !isNaN(o2Num) && o2Num >= 0 && o2Num <= 100;
};

export const validatePatientData = (patient: {
  name: string;
  age: string;
  gender: string;
  contactNumber: string;
  vitalSigns: {
    bloodPressure: string;
    pulseRate: string;
    respiratoryRate: string;
    temperature: string;
    oxygenSaturation: string;
  };
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!patient.name.trim()) {
    errors.push('Name is required');
  }

  const ageNum = parseInt(patient.age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
    errors.push('Age must be between 0 and 120');
  }

  if (!['male', 'female'].includes(patient.gender)) {
    errors.push('Gender must be either male or female');
  }

  if (patient.contactNumber && !isValidPhoneNumber(patient.contactNumber)) {
    errors.push('Invalid phone number format');
  }

  if (patient.vitalSigns.bloodPressure && !isValidBloodPressure(patient.vitalSigns.bloodPressure)) {
    errors.push('Invalid blood pressure format (should be like 120/80)');
  }

  if (patient.vitalSigns.pulseRate && !isValidPulseRate(patient.vitalSigns.pulseRate)) {
    errors.push('Invalid pulse rate (should be between 0 and 250)');
  }

  if (patient.vitalSigns.respiratoryRate && !isValidRespiratoryRate(patient.vitalSigns.respiratoryRate)) {
    errors.push('Invalid respiratory rate (should be between 0 and 60)');
  }

  if (patient.vitalSigns.temperature && !isValidTemperature(patient.vitalSigns.temperature)) {
    errors.push('Invalid temperature (should be between 35 and 42)');
  }

  if (patient.vitalSigns.oxygenSaturation && !isValidOxygenSaturation(patient.vitalSigns.oxygenSaturation)) {
    errors.push('Invalid oxygen saturation (should be between 0 and 100)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 