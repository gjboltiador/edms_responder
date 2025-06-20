import { useState, useEffect, useRef, useCallback } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  heading?: number
  speed?: number
}

interface NavigationState {
  isNavigating: boolean
  destination: [number, number] | null
  destinationName: string
  estimatedTime: string
  distance: string
  currentStep: string
  routeData: any
}

interface UseLocationTrackingReturn {
  currentLocation: LocationData | null
  locationPermission: 'granted' | 'denied' | 'prompt'
  locationError: string | null
  navigationState: NavigationState
  startLocationTracking: () => void
  stopLocationTracking: () => void
  startNavigation: (destination: [number, number], destinationName: string) => void
  stopNavigation: () => void
  updateNavigationState: (updates: Partial<NavigationState>) => void
}

export const useLocationTracking = (): UseLocationTrackingReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    destination: null,
    destinationName: '',
    estimatedTime: '',
    distance: '',
    currentStep: '',
    routeData: null
  })

  const watchIdRef = useRef<number | null>(null)
  const lastLocationRef = useRef<LocationData | null>(null)

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser')
        return false
      }

      // Check if permissions API is available
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setLocationPermission(permission.state)

          if (permission.state === 'granted') {
            return true
          } else if (permission.state === 'denied') {
            setLocationError('Location access denied. Please enable location access in your browser settings.')
            return false
          }
        } catch (permError) {
          console.warn('Permission check failed:', permError)
          // Continue with getCurrentPosition if permission check fails
        }
      }

      // If permission state is prompt or permission API not available, try getCurrentPosition
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationPermission('granted')
            setLocationError(null)
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined
            }
            setCurrentLocation(newLocation)
            lastLocationRef.current = newLocation
            resolve(true)
          },
          (error) => {
            console.error('Location permission error:', error)
            setLocationPermission('denied')
            
            let errorMessage = 'Location access denied'
            if (error && typeof error === 'object') {
              if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
                errorMessage = 'Location access denied. Please allow location access in your browser settings.'
              } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = 'Location unavailable. Please check your GPS signal and try again.'
              } else if (error.code === 3 || error.code === error.TIMEOUT) {
                errorMessage = 'Location timeout. Please check your GPS signal and try again.'
              } else if (error.message) {
                errorMessage = error.message
              }
            }
            
            setLocationError(errorMessage)
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout for mobile
            maximumAge: 60000 // Allow cached position up to 1 minute old
          }
        )
      })
    } catch (error) {
      console.error('Failed to request location permission:', error)
      setLocationError('Failed to request location permission')
      return false
    }
  }, [])

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for mobile
      maximumAge: 60000 // Allow cached position up to 1 minute old
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        }

        // Only update if location has changed significantly (more than 5 meters)
        if (!lastLocationRef.current || 
            calculateDistance(
              lastLocationRef.current.latitude,
              lastLocationRef.current.longitude,
              newLocation.latitude,
              newLocation.longitude
            ) > 5) {
          setCurrentLocation(newLocation)
          lastLocationRef.current = newLocation
          setLocationError(null) // Clear any previous errors

          // Send location update to service worker for background sync
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
              navigator.serviceWorker.controller.postMessage({
                type: 'LOCATION_UPDATE',
                location: newLocation
              })
            } catch (swError) {
              console.warn('Failed to send location to service worker:', swError)
            }
          }
        }
      },
      (error) => {
        console.error('Location tracking error:', error)
        let errorMessage = 'Location tracking error'
        
        if (error && typeof error === 'object') {
          if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied. Please check your browser settings.'
          } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location unavailable. Please check your GPS signal.'
          } else if (error.code === 3 || error.code === error.TIMEOUT) {
            errorMessage = 'Location timeout. Please check your GPS signal.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        setLocationError(errorMessage)
      },
      options
    )
  }, [])

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // Start navigation
  const startNavigation = useCallback((destination: [number, number], destinationName: string) => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true,
      destination,
      destinationName
    }))
  }, [])

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: false,
      destination: null,
      destinationName: '',
      estimatedTime: '',
      distance: '',
      currentStep: '',
      routeData: null
    }))
  }, [])

  // Update navigation state
  const updateNavigationState = useCallback((updates: Partial<NavigationState>) => {
    setNavigationState(prev => ({ ...prev, ...updates }))
  }, [])

  // Initialize location tracking
  useEffect(() => {
    const initializeLocation = async () => {
      const hasPermission = await requestLocationPermission()
      if (hasPermission) {
        startLocationTracking()
      }
    }

    initializeLocation()

    return () => {
      stopLocationTracking()
    }
  }, [requestLocationPermission, startLocationTracking, stopLocationTracking])

  // Handle service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOCATION_SYNC') {
        // Handle location sync from service worker
        console.log('Location sync requested:', event.data.timestamp)
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c * 1000 // Convert to meters
  }

  return {
    currentLocation,
    locationPermission,
    locationError,
    navigationState,
    startLocationTracking,
    stopLocationTracking,
    startNavigation,
    stopNavigation,
    updateNavigationState
  }
} 