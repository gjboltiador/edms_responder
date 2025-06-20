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

export function ReportScreen({ selectedAlert, setSelectedAlert }: ReportScreenProps) {
  const [reportTab, setReportTab] = useState(selectedAlert ? "incident" : "completed");
  const [completedReports, setCompletedReports] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [isAddPatientInfoModalOpen, setIsAddPatientInfoModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
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
    // Update the tab based on whether there's a selected alert
    setReportTab(selectedAlert ? "incident" : "completed");
  }, [selectedAlert]);

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

  const handleComplete = async () => {
    if (!selectedAlert) return;
    
    setIsCompleting(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          status: 'completed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }

      // Show success toast
      toast({
        title: "Alert Completed",
        description: "The incident has been marked as completed.",
      });

      // Refresh the reports list
      await fetchCompletedReports();
      
      // Switch to Completed Reports tab
      setReportTab("completed");
      
      // Refresh the page after a short delay to ensure all data is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error completing alert:', error);
      toast({
        title: "Error",
        description: "Failed to complete the incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ERT Reports</CardTitle>
            <CardDescription>
              View and submit incident reports
            </CardDescription>
          </div>
          {selectedAlert && patients.length > 0 && (
            <Button 
              variant="default" 
              className="bg-black hover:bg-black/90"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? "Completing..." : "Complete"}
            </Button>
          )}
        </div>
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
                      {selectedAlert.responder_name && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium min-w-[80px]">Responder:</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{selectedAlert.responder_name}</span>
                            {selectedAlert.assigned_at && (
                              <span className="text-xs text-muted-foreground ml-2">
                                • Assigned {new Date(selectedAlert.assigned_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
                  <Card key={report.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Header with Type and Status */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{report.type}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Reported {new Date(report.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getSeverityColor(report.severity)} px-2.5 py-0.5 text-xs rounded-full`}>
                              {report.severity}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-0.5 border text-emerald-600 border-emerald-200"
                            >
                              {report.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-slate-700">Location</span>
                            <p className="text-sm text-slate-600 mt-0.5">{report.location}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <span className="text-sm font-medium text-slate-700">Description</span>
                          <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                        </div>

                        {/* Responder Information */}
                        {report.responder_name && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium text-slate-700">Responder</span>
                              <p className="text-sm text-slate-600 mt-0.5">
                                {report.responder_name}
                                {report.assigned_at && (
                                  <span className="text-xs text-slate-500 ml-2">
                                    • Assigned {new Date(report.assigned_at).toLocaleString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* View Patients Button */}
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setSelectedAlert(report);
                              setReportTab("incident");
                            }}
                          >
                            View Patients
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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