"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, User, Navigation, Maximize2 } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import TrackingHistory from "./tracking-history"
import { toast } from "@/components/ui/use-toast"
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Dynamically import the MapView component with no SSR
const MapView = dynamic(() => import('./map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-b-lg bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

interface Alert {
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

interface DirectionsInfo {
  distance: string;
  duration: string;
  steps: Array<{
    instructions: string;
    distance: string;
    duration: string;
  }>;
}

interface DispatchAlertScreenProps {
  setActiveTab: (tab: string) => void;
  setSelectedAlert: (alert: Alert | null) => void;
}

function DispatchAlertScreenContent({ setActiveTab, setSelectedAlert }: DispatchAlertScreenProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<[number, number] | null>(null);
  const [showDirections, setShowDirections] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [destinationName, setDestinationName] = useState<string>('')
  const [directions, setDirections] = useState<Array<{
    instruction: string
    distance: number
    duration: number
  }>>([])
  const [directionsInfo, setDirectionsInfo] = useState<DirectionsInfo | null>(null)
  const searchParams = useSearchParams()
  const focusedAlertId = searchParams.get('alert')
  const router = useRouter()
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    loadAlerts()
    // Get the selected alert ID from localStorage
    const selectedId = localStorage.getItem('selectedAlertId')
    if (selectedId) {
      // Clear it immediately to avoid persisting the selection
      localStorage.removeItem('selectedAlertId')
      // Find and scroll to the alert after alerts are loaded
      if (alerts.length > 0) {
        const alert = alerts.find(a => a.id === parseInt(selectedId))
        if (alert) {
          const alertElement = document.getElementById(`alert-${alert.id}`)
          if (alertElement) {
            alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Add a temporary highlight class
            alertElement.classList.add('ring-2', 'ring-blue-500')
            setTimeout(() => {
              alertElement.classList.remove('ring-2', 'ring-blue-500')
            }, 3000) // Remove highlight after 3 seconds
          }
        }
      }
    }
  }, [alerts])

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      const data = await response.json()
      // Filter out completed alerts using case-insensitive comparison
      const activeAlerts = data.filter((alert: Alert) => alert.status?.toLowerCase() !== "completed")
      setAlerts(activeAlerts)
      setLoading(false)
    } catch (err) {
      setError('Failed to load alerts')
      setLoading(false)
    }
  }

  // Function to start GPS tracking with error handling and status updates
  const startGpsTracking = (alertId: number) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    // Clear any existing tracking
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }

    // Set active tracking ID
    setActiveTrackingId(alertId);

    // Initial location update
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLastLocation([latitude, longitude]);
        await updateLocation(alertId, latitude, longitude);
      },
      (error) => {
        console.error('Error getting initial location:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location Access Denied",
            description: "Please allow location access in your browser settings to use GPS tracking.",
            variant: "destructive",
          });
        } else if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
          toast({
            title: "Location Unavailable",
            description: "Unable to retrieve your current location. Please check your device settings and internet connection.",
            variant: "destructive",
          });
        } else if (error.code === 2) { // SECURITY_ERR is code 2
          toast({
            title: "Insecure Origin Blocked",
            description: "Geolocation is only available on secure origins (HTTPS). Please ensure you are accessing the application over HTTPS.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Geolocation Error",
            description: `An unexpected error occurred: ${error.message}`,
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Set up interval for continuous tracking
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLastLocation([latitude, longitude]);
          await updateLocation(alertId, latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            toast({
              title: "Location Access Denied",
              description: "Please allow location access in your browser settings to use GPS tracking.",
              variant: "destructive",
            });
          } else if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
            toast({
              title: "Location Unavailable",
              description: "Unable to retrieve your current location. Please check your device settings and internet connection.",
              variant: "destructive",
            });
          } else if (error.code === 2) { // SECURITY_ERR is code 2
            toast({
              title: "Insecure Origin Blocked",
              description: "Geolocation is only available on secure origins (HTTPS). Please ensure you are accessing the application over HTTPS.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Geolocation Error",
              description: `An unexpected error occurred: ${error.message}`,
              variant: "destructive",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }, 30000);

    setTrackingInterval(interval);
  };

  // Function to update location
  const updateLocation = async (alertId: number, latitude: number, longitude: number) => {
    try {
      const response = await fetch('/api/gps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dispatch_id: alertId,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Stop GPS tracking with cleanup
  const stopGpsTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setActiveTrackingId(null);
    setLastLocation(null);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  const handleStatusUpdate = async (alertId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId, status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      if (newStatus === 'accepted') {
        startGpsTracking(alertId);
      } else if (newStatus === 'completed') {
        stopGpsTracking();
      }
      
      await loadAlerts();
    } catch (err) {
      setError('Failed to update alert status');
    }
  };

  const handleCompleteAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setActiveTab("report");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-400 text-white'; // Lighter emergency red
      case 'medium':
        return 'bg-yellow-200 text-black'; // Lighter emergency yellow
      case 'low':
        return 'bg-green-300 text-black'; // Lighter emergency green
      default:
        return 'bg-gray-400 text-white';
    }
  }

  const navigateToLocation = async (alert: Alert) => {
    try {
      // Get current location with better error handling and increased timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 0
        });
      }).catch((error) => {
        console.error('Error getting current location or navigating:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location Access Denied",
            description: "Please allow location access in your browser settings to provide directions.",
            variant: "destructive",
          });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast({
            title: "Location Unavailable",
            description: "Unable to retrieve your current location. Please check your device settings and internet connection.",
            variant: "destructive",
          });
        } else if (error.code === error.TIMEOUT) {
          toast({
            title: "Location Timeout",
            description: "It's taking too long to get your location. Please check your GPS signal and try again.",
            variant: "destructive",
          });
        } else if (error.code === 2) { // SECURITY_ERR is code 2
          toast({
            title: "Insecure Origin Blocked",
            description: "Geolocation is only available on secure origins (HTTPS). Please ensure you are accessing the application over HTTPS.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Geolocation Error",
            description: `An unexpected error occurred: ${error.message}`,
            variant: "destructive",
          });
        }
        throw error; // Re-throw to propagate the error and stop execution
      });

      if (!position) return; // If position is null, it means an error occurred and was handled by toast

      // Set the current location and destination for the map
      setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      setDestination([alert.latitude, alert.longitude]);
      setDestinationName(alert.location);
      setShowDirections(true);
      setIsMapOpen(true);
      // Blur the currently focused element (the button that opened the dialog)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch (error) {
      // This catch block will primarily handle errors re-thrown from the Promise catch
      // and any other unexpected errors during navigation.
      console.error("Unhandled error during navigation:", error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading alerts...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Dispatch Alerts</CardTitle>
          <CardDescription>
            View and manage emergency alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-12">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active alerts to display.
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} id={`alert-${alert.id}`}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{alert.type}</CardTitle>
                      <CardDescription>{alert.location}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={
                        (!alert.status || alert.status.toLowerCase() === 'pending')
                          ? 'bg-amber-200 text-amber-800'
                          : alert.status.toLowerCase() === 'accepted'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                      }>
                        {alert.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Reported {new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    {(!alert.status || alert.status.toLowerCase() === 'pending') && (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate(alert.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(alert.id, 'declined')}
                          variant="destructive"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {alert.status?.toLowerCase() === 'accepted' && (
                      <>
                        <Button 
                          onClick={() => navigateToLocation(alert)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Navigation className="h-4 w-4 mr-2" /> Navigate
                        </Button>
                        <Button 
                          onClick={() => handleCompleteAlert(alert)}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          ERT Report
                        </Button>
                      </>
                    )}
                    {alert.status?.toLowerCase() === 'declined' && (
                      <Badge variant="secondary" className="ml-2">
                        Declined
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Directions to {destinationName}</DialogTitle>
            <DialogDescription>Full-screen map view for directions.</DialogDescription>
          </DialogHeader>
          {showDirections && currentLocation && destination && (
            <div className="h-full">
              <MapView
                currentLocation={currentLocation}
                destination={destination}
                destinationName={destinationName}
                severity={alerts.find(a => a.location === destinationName)?.severity || 'low'}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function DispatchAlertScreen(props: DispatchAlertScreenProps) {
  return (
    <Suspense fallback={<div>Loading Dispatch Screen...</div>}>
      <DispatchAlertScreenContent {...props} />
    </Suspense>
  )
}
