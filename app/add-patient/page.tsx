'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPatient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        address: formData.get('address'),
        contactNumber: formData.get('contactNumber'),
        contactPerson: formData.get('contactPerson'),
        chiefComplaint: formData.get('chiefComplaint'),
        pertinentSymptoms: formData.get('pertinentSymptoms'),
        allergies: formData.get('allergies'),
        currentMedications: formData.get('currentMedications'),
        pastMedicalHistory: formData.get('pastMedicalHistory'),
        lastOralIntake: formData.get('lastOralIntake'),
        historyOfPresentIllness: formData.get('historyOfPresentIllness'),
        vitalSigns: {
          bloodPressure: formData.get('bloodPressure'),
          pulseRate: formData.get('pulseRate'),
          respiratoryRate: formData.get('respiratoryRate'),
          temperature: formData.get('temperature'),
          oxygenSaturation: formData.get('oxygenSaturation'),
        },
        patientStatus: {
          conscious: formData.get('conscious') === 'on',
          unconscious: formData.get('unconscious') === 'on',
          deceased: formData.get('deceased') === 'on',
          verbal: formData.get('verbal') === 'on',
          pain: formData.get('pain') === 'on',
          alert: formData.get('alert') === 'on',
          lethargic: formData.get('lethargic') === 'on',
          obtunded: formData.get('obtunded') === 'on',
          stupor: formData.get('stupor') === 'on',
        },
        management: {
          firstAidDressing: formData.get('firstAidDressing') === 'on',
          splinting: formData.get('splinting') === 'on',
          ambuBagging: formData.get('ambuBagging') === 'on',
          oxygenTherapy: formData.get('oxygenTherapy') === 'on',
          oxygenLitersPerMin: formData.get('oxygenLitersPerMin'),
          cpr: formData.get('cpr') === 'on',
          cprStarted: formData.get('cprStarted'),
          cprEnded: formData.get('cprEnded'),
          aed: formData.get('aed') === 'on',
          medicationsGiven: formData.get('medicationsGiven') === 'on',
          medicationsSpecify: formData.get('medicationsSpecify'),
          others: formData.get('others') === 'on',
          othersSpecify: formData.get('othersSpecify'),
          headImmobilization: formData.get('headImmobilization') === 'on',
          controlBleeding: formData.get('controlBleeding') === 'on',
          ked: formData.get('ked') === 'on',
        },
        mechanismOfInjury: formData.get('mechanismOfInjury'),
        traumaScore: formData.get('traumaScore'),
        bodyRegionAssessment: formData.get('bodyRegionAssessment'),
        traumaInterventions: formData.get('traumaInterventions'),
        causeOfInjuries: formData.get('causeOfInjuries'),
        typesOfInjuries: formData.get('typesOfInjuries'),
        locationOfIncident: formData.get('locationOfIncident'),
        remarks: formData.get('remarks'),
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient');
      }

      // Redirect to patients list or show success message
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="text"
                name="age"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Diagnostic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
              <textarea
                name="chiefComplaint"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pertinent Symptoms</label>
              <textarea
                name="pertinentSymptoms"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Allergies</label>
              <textarea
                name="allergies"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Medications</label>
              <textarea
                name="currentMedications"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Past Medical History</label>
              <textarea
                name="pastMedicalHistory"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Oral Intake</label>
              <input
                type="text"
                name="lastOralIntake"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">History of Present Illness</label>
              <textarea
                name="historyOfPresentIllness"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pulse Rate</label>
              <input
                type="text"
                name="pulseRate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
              <input
                type="text"
                name="respiratoryRate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperature</label>
              <input
                type="text"
                name="temperature"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Oxygen Saturation</label>
              <input
                type="text"
                name="oxygenSaturation"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Patient Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Patient Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="conscious"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Conscious</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="unconscious"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Unconscious</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="deceased"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Deceased</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="verbal"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Verbal</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="pain"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Pain</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="alert"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Alert</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="lethargic"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Lethargic</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="obtunded"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Obtunded</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="stupor"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Stupor</label>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Management</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="firstAidDressing"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">First Aid Dressing</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="splinting"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Splinting</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ambuBagging"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Ambu Bagging</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="oxygenTherapy"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Oxygen Therapy</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="cpr"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">CPR</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="aed"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">AED</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="medicationsGiven"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Medications Given</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="headImmobilization"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Head Immobilization</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="controlBleeding"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Control Bleeding</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ked"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">KED</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Oxygen Liters/Min</label>
                <input
                  type="text"
                  name="oxygenLitersPerMin"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CPR Started</label>
                <input
                  type="time"
                  name="cprStarted"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CPR Ended</label>
                <input
                  type="time"
                  name="cprEnded"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medications Specify</label>
                <textarea
                  name="medicationsSpecify"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trauma Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Trauma Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mechanism of Injury</label>
              <textarea
                name="mechanismOfInjury"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trauma Score</label>
              <input
                type="text"
                name="traumaScore"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body Region Assessment</label>
              <textarea
                name="bodyRegionAssessment"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trauma Interventions</label>
              <textarea
                name="traumaInterventions"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cause of Injuries</label>
              <textarea
                name="causeOfInjuries"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Types of Injuries</label>
              <textarea
                name="typesOfInjuries"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location of Incident</label>
              <input
                type="text"
                name="locationOfIncident"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </button>
        </div>
      </form>
    </div>
  );
} 