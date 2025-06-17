import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, ReportScreenProps } from '@/components/reports/types';
import { usePatientManagement } from '@/components/reports/hooks/usePatientManagement';
import { PatientForm } from '@/components/reports/forms/PatientForm';
import { PatientList } from '@/components/reports/PatientList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, MapPin, Plus, User, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Patient } from '@/types/patient';
import { AddPatientInfoModal } from '@/components/reports/AddPatientInfoModal';
import { EditPatientModal } from '@/components/reports/EditPatientModal';
import { toast } from "@/components/ui/use-toast";

export function ReportScreen({ selectedAlert }: ReportScreenProps) {
  const [reportTab, setReportTab] = useState("incident");
  const [completedReports, setCompletedReports] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [isAddPatientInfoModalOpen, setIsAddPatientInfoModalOpen] = useState(false);
  
  const {
    isAddPatientDialogOpen,
    setIsAddPatientDialogOpen,
    handleAddPatient,
    handleDeletePatient,
    openEditDialog,
  } = usePatientManagement();

  useEffect(() => {
    fetchCompletedReports();
  }, []);

  useEffect(() => {
    if (selectedAlert) {
      fetchPatientsForAlert(selectedAlert.id);
    } else {
      setPatients([]);
    }
  }, [selectedAlert]);

  const fetchCompletedReports = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch completed reports');
      }
      const data = await response.json();
      // Filter to show only completed emergencies
      const completedAlerts = data.filter((alert: Alert) => 
        alert.status === 'Completed' || alert.status === 'Resolved'
      );
      setCompletedReports(completedAlerts);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load completed reports:', err);
      setLoading(false);
    }
  };

  const fetchPatientsForAlert = async (alertId: number) => {
    setPatientsLoading(true);
    try {
      console.log('ReportScreen: Fetching patients for alert ID:', alertId);
      
      if (!alertId || isNaN(alertId)) {
        console.error('ReportScreen: Invalid alert ID:', alertId);
        throw new Error('Invalid alert ID');
      }

      console.log('ReportScreen: Making API request to /api/alerts/${alertId}/patients');
      const response = await fetch(`/api/alerts/${alertId}/patients`);
      console.log('ReportScreen: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('ReportScreen: Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch patients');
      }

      const data = await response.json();
      console.log('ReportScreen: Fetched patients:', JSON.stringify(data, null, 2));
      
      // Log the structure of the first patient
      if (data.length > 0) {
        console.log('ReportScreen: First patient structure:', {
          id: data[0].id,
          name: data[0].name,
          vitalSigns: data[0].vitalSigns,
          patientStatus: data[0].patientStatus,
          management: data[0].management
        });
      }
      
      setPatients(data);
    } catch (err) {
      console.error('ReportScreen: Failed to load patients:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to load patients',
        variant: "destructive",
      });
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleAddPatientSuccess = async (newPatient: Patient) => {
    if (selectedAlert) {
      await fetchPatientsForAlert(selectedAlert.id);
    }
  };

  const handleReportTabChange = (value: string) => {
    setReportTab(value);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleEditPatient = async (updatedPatientData: Partial<Patient>) => {
    if (!selectedAlert || !selectedPatient) return;
    
    console.log('Selected patient:', selectedPatient);
    console.log('Updated patient data:', updatedPatientData);
    
    try {
      const updatedPatient: Patient = {
        ...selectedPatient,
        ...updatedPatientData,
        updatedAt: new Date().toISOString(),
      } as Patient;

      console.log('Sending update request for patient:', updatedPatient);
      console.log('Patient ID:', updatedPatient.id);

      const response = await fetch(`/api/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPatient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed with status:', response.status);
        console.error('Error data:', errorData);
        throw new Error('Failed to update patient');
      }

      await fetchPatientsForAlert(selectedAlert.id);
      setIsEditPatientModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditPatientModalOpen(true);
  };

  const handleDeletePatientAndRefresh = async (patientId: string) => {
    try {
      await handleDeletePatient(patientId, selectedAlert ? () => fetchPatientsForAlert(selectedAlert.id) : undefined);
    } catch (error) {
      // Error handling is already in the hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ERT Reports</CardTitle>
        <CardDescription>
          View and submit incident reports
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-12">
        <Tabs value={reportTab} onValueChange={handleReportTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="incident">Incident Reports</TabsTrigger>
            <TabsTrigger value="completed">Completed Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="incident" className="h-[calc(122vh-100px)] overflow-y-auto thin-scrollbar">
            <div className="space-y-4">
              {selectedAlert && (
                <>
                  <div className="mb-4 p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Incident Summary</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold">
                          {selectedAlert.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium min-w-[80px]">Type:</span>
                        <span className="text-sm text-muted-foreground">{selectedAlert.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium min-w-[80px]">Location:</span>
                        <span className="text-sm text-muted-foreground">{selectedAlert.location}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium min-w-[80px] pt-0.5">Description:</span>
                        <span className="text-sm text-muted-foreground">{selectedAlert.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium min-w-[80px]">Severity:</span>
                        <Badge variant={selectedAlert.severity === 'high' ? 'destructive' : 'default'} className="px-2 py-0.5 text-xs font-semibold">
                          {selectedAlert.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium min-w-[80px]">Reported:</span>
                        <span className="text-sm text-muted-foreground">{new Date(selectedAlert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Management Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Patients Involved</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {patientsLoading ? (
                            "Loading..."
                          ) : (
                            `${patients.length} patient${patients.length !== 1 ? 's' : ''}`
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsAddPatientInfoModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Patient
                      </Button>
                    </div>

                    {patientsLoading ? (
                      <div className="text-center py-8 border rounded-md bg-muted/50">
                        <p className="text-sm text-muted-foreground">Loading patients...</p>
                      </div>
                    ) : (
                      <>
                        {/* Patient List */}
                        {patients.length > 0 ? (
                          <div className="w-full">
                            <PatientList
                              patients={patients}
                              onEdit={handleEditClick}
                              onDelete={handleDeletePatientAndRefresh}
                              onView={() => {}}
                            />
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md bg-muted/50">
                            <p className="text-sm text-muted-foreground">No patients added yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Click "Add Patient" to begin</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="h-[calc(122vh-100px)] overflow-y-auto">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-sm">Loading completed reports...</div>
              ) : completedReports.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No completed reports found.
                </div>
              ) : (
                completedReports.map((report) => (
                  <div 
                    key={report.id}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 truncate">{report.type}</h3>
                        </div>
                        <Badge className={`${getSeverityColor(report.severity)} px-2.5 py-0.5 text-xs rounded-full flex-shrink-0`}>
                          {report.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm truncate">{report.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(report.created_at).toLocaleString()}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 border text-emerald-600 border-emerald-200"
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Patient Management Dialogs */}
        {selectedAlert && (
          <>
            <AddPatientInfoModal
              isOpen={isAddPatientInfoModalOpen}
              onClose={() => setIsAddPatientInfoModalOpen(false)}
              onSubmit={handleAddPatientSuccess}
              selectedAlert={selectedAlert}
            />

            {selectedPatient && (
              <EditPatientModal
                isOpen={isEditPatientModalOpen}
                onClose={() => {
                  setIsEditPatientModalOpen(false);
                  setSelectedPatient(null);
                }}
                onSubmit={handleEditPatient}
                selectedAlert={selectedAlert}
                patient={selectedPatient}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 