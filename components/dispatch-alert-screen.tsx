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

// Dynamically import the EnhancedMapView component with no SSR
const EnhancedMapView = dynamic(() => import('./map/EnhancedMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
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
  responder_id?: number;
  responder_name?: string;
  responder_username?: string;
  assigned_at?: string;
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
  user?: { id: number; username: string; firstname: string; lastname: string } | null;
}

function DispatchAlertScreenContent({ setActiveTab, setSelectedAlert, user }: DispatchAlertScreenProps) {
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
  const [responderId, setResponderId] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const focusedAlertId = searchParams.get('alert')
  const router = useRouter()
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

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

  const loadResponderId = async () => {
    try {
      // Use the user prop to get the username
      const username = user?.username
      if (!username) {
        console.log('No username available for responder lookup')
        return
      }

      // Get responder ID by username
      const response = await fetch(`/api/responder/status?username=${encodeURIComponent(username)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setResponderId(data.id)
        }
      }
    } catch (error) {
      console.error('Failed to load responder ID:', error)
    }
  }

  useEffect(() => {
    loadAlerts()
    loadResponderId()
  }, [])

  useEffect(() => {
    // Get the selected alert ID from localStorage
    const selectedId = localStorage.getItem('selectedAlertId')
    if (selectedId && alerts.length > 0) {
      const alertId = parseInt(selectedId)
      setSelectedAlertId(alertId)
      // Clear it immediately to avoid persisting the selection
      localStorage.removeItem('selectedAlertId')
      
      // Find and scroll to the alert after a short delay to ensure DOM is ready
      setTimeout(() => {
        const alertElement = document.getElementById(`alert-${alertId}`)
        if (alertElement) {
          alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add a temporary highlight class with better styling
          alertElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-75', 'shadow-lg')
          setTimeout(() => {
            alertElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-75', 'shadow-lg')
            setSelectedAlertId(null) // Clear the selection after highlighting
          }, 4000) // Remove highlight after 4 seconds
        }
      }, 100)
    }
  }, [alerts])

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
      const payload: any = { alertId, status: newStatus }
      
      // Add responder ID if available
      if (responderId) {
        payload.responderId = responderId
      }
      
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support geolocation. Please use a modern browser.",
          variant: "destructive",
        });
        return;
      }

      // Debug: Log browser info
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        geolocation: !!navigator.geolocation,
        permissions: !!navigator.permissions,
        secureContext: window.isSecureContext
      });

      // Check permission status first
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          console.log('Permission status:', permissionStatus.state);
          if (permissionStatus.state === 'denied') {
            toast({
              title: "Location Access Denied",
              description: "Please allow location access in your browser settings to provide directions.",
              variant: "destructive",
            });
            return;
          }
        } catch (permError) {
          console.warn('Permission check failed:', permError);
          // Continue anyway, the getCurrentPosition will handle the error
        }
      } else {
        console.log('Permissions API not available, proceeding with getCurrentPosition');
      }

      // Get current location with better error handling and increased timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        console.log('Requesting location with options:', {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 60000
        });
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout to 20 seconds for mobile
          maximumAge: 60000 // Allow cached position up to 1 minute old
        });
      }).catch((error) => {
        console.error('Error getting current location:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        // Handle different error types with better mobile support
        let errorMessage = "Unable to get your location. Please check your device settings.";
        let errorTitle = "Location Error";
        
        if (error && typeof error === 'object') {
          if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
            errorTitle = "Location Access Denied";
            errorMessage = "Please allow location access in your browser settings to provide directions.";
          } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
            errorTitle = "Location Unavailable";
            errorMessage = "Unable to retrieve your current location. Please check your GPS signal and try again.";
          } else if (error.code === 3 || error.code === error.TIMEOUT) {
            errorTitle = "Location Timeout";
            errorMessage = "It's taking too long to get your location. Please check your GPS signal and try again.";
          } else if (error.code === 2) { // SECURITY_ERR
            errorTitle = "Insecure Origin Blocked";
            errorMessage = "Geolocation is only available on secure origins (HTTPS). Please ensure you are accessing the application over HTTPS.";
          } else if (error.message) {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        
        throw error; // Re-throw to propagate the error and stop execution
      });

      if (!position) {
        toast({
          title: "Location Error",
          description: "No location data received. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Validate position data
      if (!position.coords || typeof position.coords.latitude !== 'number' || typeof position.coords.longitude !== 'number') {
        toast({
          title: "Invalid Location Data",
          description: "Received invalid location coordinates. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Location obtained successfully:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });

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
      
      // Provide a generic error message if we haven't already shown a specific one
      toast({
        title: "Navigation Error",
        description: "An unexpected error occurred while trying to get your location. Please try again.",
        variant: "destructive",
      });
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
            {selectedAlertId && (
              <span className="block mt-1 text-sm text-blue-600 font-medium">
                ✨ Alert highlighted from home page
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-12">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active alerts to display.
            </div>
          ) : (
            // Sort alerts to put selected alert first, then by creation date
            alerts
              .sort((a, b) => {
                // If there's a selected alert, put it first
                if (selectedAlertId) {
                  if (a.id === selectedAlertId) return -1;
                  if (b.id === selectedAlertId) return 1;
                }
                // Otherwise sort by creation date (newest first)
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              })
              .map((alert) => (
                <Card 
                  key={alert.id} 
                  id={`alert-${alert.id}`}
                  className={`transition-all duration-300 ${
                    selectedAlertId === alert.id 
                      ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg scale-[1.02]' 
                      : ''
                  }`}
                >
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
                  
                  {/* Display responder information if alert is accepted/declined */}
                  {(alert.status?.toLowerCase() === 'accepted' || alert.status?.toLowerCase() === 'declined') && alert.responder_name && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>
                        {alert.status?.toLowerCase() === 'accepted' ? 'Accepted' : 'Declined'} by: {alert.responder_name}
                      </span>
                      {alert.assigned_at && (
                        <span className="text-gray-400">
                          • {new Date(alert.assigned_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  
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
        <DialogContent className="max-w-4xl h-[80vh] p-0" data-modal="true">
          <DialogHeader className="p-6 pb-4">
            <div>
              <DialogTitle>Directions to {destinationName}</DialogTitle>
              {alerts.find(a => a.location === destinationName) && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alerts.find(a => a.location === destinationName)?.severity === 'high' ? 'bg-red-500' : 
                    alerts.find(a => a.location === destinationName)?.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-semibold text-gray-900">
                    {alerts.find(a => a.location === destinationName)?.type}
                  </span>
                  <Badge variant={
                    alerts.find(a => a.location === destinationName)?.severity === 'high' ? 'destructive' : 'default'
                  } className="text-xs">
                    {alerts.find(a => a.location === destinationName)?.severity}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ID: #{alerts.find(a => a.location === destinationName)?.id} • {
                      alerts.find(a => a.location === destinationName)?.created_at ? 
                      new Date(alerts.find(a => a.location === destinationName)!.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
                    }
                  </span>
                </div>
              )}
              <DialogDescription>Full-screen map view for directions.</DialogDescription>
            </div>
          </DialogHeader>
          {showDirections && currentLocation && destination && (
            <div className="h-full px-6 pb-6" data-modal="true">
              <EnhancedMapView
                currentLocation={currentLocation}
                destination={destination}
                destinationName={destinationName}
                severity={alerts.find(a => a.location === destinationName)?.severity || 'low'}
                isNavigating={false}
                isOnline={navigator.onLine}
                onNavigationUpdate={() => {}}
                className="modal-map-container"
                alert={alerts.find(a => a.location === destinationName)}
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
