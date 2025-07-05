"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation, MapPin, Wifi, WifiOff, Compass, Target, AlertTriangle } from 'lucide-react'
import { useLocationTracking } from '@/hooks/useLocationTracking'

// Dynamically import the enhanced MapView component with no SSR
const EnhancedMapView = dynamic(() => import('@/components/map/EnhancedMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading navigation...</p>
      </div>
    </div>
  ),
})

export default function Map() {
  const [isOnline, setIsOnline] = useState(true) // Default to true, will be updated in useEffect
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number, lng: number, time: string}>>([])
  
  const {
    currentLocation,
    locationPermission,
    locationError,
    navigationState,
    startLocationTracking,
    startNavigation,
    stopNavigation,
    updateNavigationState
  } = useLocationTracking()

  // Track location history for debugging
  useEffect(() => {
    if (currentLocation) {
      setLocationHistory(prev => [
        { lat: currentLocation.latitude, lng: currentLocation.longitude, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4) // Keep last 5 locations
      ])
    }
  }, [currentLocation])

  // Check online status
  useEffect(() => {
    // Set initial online status
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Register service worker
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration)
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  // Load active alerts for navigation
  useEffect(() => {
    const loadActiveAlerts = async () => {
      try {
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const alerts = await response.json()
          const activeAlerts = alerts.filter((alert: any) => 
            alert.status === 'Pending' || alert.status === 'Accepted'
          )
          if (activeAlerts.length > 0) {
            setSelectedAlert(activeAlerts[0])
          }
        }
      } catch (error) {
        console.error('Failed to load alerts:', error)
      }
    }

    loadActiveAlerts()
  }, [])

  const handleStartNavigation = () => {
    if (selectedAlert) {
      startNavigation(
        [selectedAlert.latitude, selectedAlert.longitude],
        `Emergency: ${selectedAlert.type}`
      )
    } else {
      // Fallback to mock destination
      startNavigation([14.5995, 120.9842], 'Emergency Location')
    }
  }

  if (locationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Location Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 mb-4">{locationError}</p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/location-test'} 
                className="w-full"
              >
                Test Location Access
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="font-semibold text-blue-900 mb-2">How to Fix:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>1. Click the lock/shield icon in your browser's address bar</div>
                <div>2. Find "Location" in the permissions list</div>
                <div>3. Change it from "Block" to "Allow"</div>
                <div>4. Refresh this page and try again</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Getting Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">
                {locationPermission === 'prompt' 
                  ? 'Please allow location access to use navigation'
                  : 'Acquiring your current location...'
                }
              </p>
              {locationPermission === 'denied' && (
                <p className="text-sm text-red-600 mb-4">
                  Location access is required for navigation. Please enable it in your browser settings.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock destination for testing - in real app, this would come from alerts
  const mockDestination: [number, number] = [14.5995, 120.9842]

  return (
    <div className="h-screen flex flex-col">
      {/* Enhanced Status Bar with Alert Info */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - System status */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Accuracy: {currentLocation.accuracy.toFixed(0)}m
            </Badge>
            <Badge variant="default" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Tracking
            </Badge>
            {currentLocation?.heading !== undefined && (
              <Badge variant="outline" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {Math.round(currentLocation.heading)}°
              </Badge>
            )}
          </div>

          {/* Center - Alert information */}
          {selectedAlert && (
            <div className="flex flex-col gap-1 items-center flex-1 mx-4">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-sm text-gray-600">{selectedAlert.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  selectedAlert.severity === 'high' ? 'bg-red-500' : 
                  selectedAlert.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <span className="font-semibold text-gray-900">{selectedAlert.type}</span>
                <Badge variant={selectedAlert.severity === 'high' ? 'destructive' : 'default'} className="text-xs">
                  {selectedAlert.severity}
                </Badge>
                <span className="text-xs text-gray-500">
                  ID: #{selectedAlert.id} • {new Date(selectedAlert.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Right side - Navigation controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {navigationState.isNavigating ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={stopNavigation}
                className="flex items-center gap-1"
              >
                <Navigation className="h-4 w-4" />
                Stop Navigation
              </Button>
                        ) : (
              <>
                <Button 
                  size="sm"
                  onClick={handleStartNavigation}
                  className="flex items-center gap-1"
                  disabled={!selectedAlert}
                >
                  <Navigation className="h-4 w-4" />
                  Start Navigation
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={startLocationTracking}
                  className="flex items-center gap-1"
                  title="Refresh location"
                >
                  <Target className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="flex-1 relative">
        <EnhancedMapView
          currentLocation={[currentLocation.latitude, currentLocation.longitude]}
          destination={navigationState.destination || (selectedAlert ? [selectedAlert.latitude, selectedAlert.longitude] : mockDestination)}
          destinationName={navigationState.destinationName || (selectedAlert ? `Emergency: ${selectedAlert.type}` : 'Emergency Location')}
          severity={selectedAlert?.severity || "high"}
          isNavigating={navigationState.isNavigating}
          isOnline={isOnline}
          onNavigationUpdate={(updates) => updateNavigationState(updates)}
          alert={selectedAlert}
          currentLocationData={currentLocation}
        />
      </div>

      {/* Navigation Info Panel */}
      {navigationState.isNavigating && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{navigationState.destinationName}</h3>
              <p className="text-sm text-gray-600">{navigationState.currentStep}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{navigationState.distance}</p>
              <p className="text-sm text-gray-600">{navigationState.estimatedTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Info Panel (when not navigating) */}
      {!navigationState.isNavigating && selectedAlert && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Active Emergency</h3>
              <p className="text-sm text-gray-600">{selectedAlert.description}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedAlert.location}</p>
            </div>
            <div className="text-right">
              <Badge variant={selectedAlert.severity === 'high' ? 'destructive' : 'default'}>
                {selectedAlert.severity}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{selectedAlert.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel - Location History */}
      {process.env.NODE_ENV === 'development' && locationHistory.length > 0 && (
        <div className="bg-gray-100 border-t border-gray-200 p-2 text-xs">
          <div className="font-semibold mb-1">Location History (Debug):</div>
          {locationHistory.map((loc, index) => (
            <div key={index} className="text-gray-600">
              {loc.time}: {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 