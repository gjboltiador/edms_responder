import { useState, useEffect, useRef, useCallback } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  heading?: number
  speed?: number
  bearing?: number // Calculated bearing to destination
}

interface NavigationState {
  isNavigating: boolean
  destination: [number, number] | null
  destinationName: string
  estimatedTime: string
  distance: string
  currentStep: string
  routeData: any
  bearing: number
  voiceEnabled: boolean
}

interface UseEnhancedLocationTrackingReturn {
  currentLocation: LocationData | null
  locationPermission: 'granted' | 'denied' | 'prompt'
  locationError: string | null
  navigationState: NavigationState
  startLocationTracking: () => void
  stopLocationTracking: () => void
  startNavigation: (destination: [number, number], destinationName: string) => void
  stopNavigation: () => void
  updateNavigationState: (updates: Partial<NavigationState>) => void
  toggleVoiceNavigation: () => void
  speakInstruction: (text: string) => void
}

export const useEnhancedLocationTracking = (): UseEnhancedLocationTrackingReturn => {
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
    routeData: null,
    bearing: 0,
    voiceEnabled: false
  })

  const watchIdRef = useRef<number | null>(null)
  const lastLocationRef = useRef<LocationData | null>(null)
  const routeRecomputeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    bearing = (bearing + 360) % 360 // Normalize to 0-360
    
    return bearing
  }

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

  // Voice navigation function
  const speakInstruction = useCallback((text: string) => {
    if (speechSynthesisRef.current && navigationState.voiceEnabled) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Try to use a navigation-friendly voice
      const voices = speechSynthesisRef.current.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Alex')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesisRef.current.speak(utterance)
    }
  }, [navigationState.voiceEnabled])

  // Toggle voice navigation
  const toggleVoiceNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      voiceEnabled: !prev.voiceEnabled
    }))
  }, [])

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
            timeout: 15000,
            maximumAge: 60000
          }
        )
      })
    } catch (error) {
      console.error('Failed to request location permission:', error)
      setLocationError('Failed to request location permission')
      return false
    }
  }, [])

  // Start location tracking with enhanced features
  const startLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
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

        // Calculate bearing to destination if navigating
        if (navigationState.isNavigating && navigationState.destination) {
          newLocation.bearing = calculateBearing(
            newLocation.latitude,
            newLocation.longitude,
            navigationState.destination[0],
            navigationState.destination[1]
          )
        }

        // Only update if location has changed significantly (more than 3 meters for navigation)
        const minDistance = navigationState.isNavigating ? 3 : 5
        if (!lastLocationRef.current || 
            calculateDistance(
              lastLocationRef.current.latitude,
              lastLocationRef.current.longitude,
              newLocation.latitude,
              newLocation.longitude
            ) > minDistance) {
          
          setCurrentLocation(newLocation)
          lastLocationRef.current = newLocation
          setLocationError(null)

          // Update bearing in navigation state
          if (navigationState.isNavigating && newLocation.bearing !== undefined) {
            setNavigationState(prev => ({
              ...prev,
              bearing: newLocation.bearing || 0
            }))
          }

          // Trigger route recomputation if navigating
          if (navigationState.isNavigating) {
            // Clear existing timer
            if (routeRecomputeTimerRef.current) {
              clearTimeout(routeRecomputeTimerRef.current)
            }
            
            // Set new timer for route recomputation (every 30 seconds)
            routeRecomputeTimerRef.current = setTimeout(() => {
              // This will trigger route recomputation in the map component
              console.log('Route recomputation triggered')
            }, 30000)
          }

          // Send location update to service worker
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
  }, [navigationState.isNavigating, navigationState.destination])

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (routeRecomputeTimerRef.current) {
      clearTimeout(routeRecomputeTimerRef.current)
      routeRecomputeTimerRef.current = null
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
    
    // Speak navigation start
    speakInstruction(`Starting navigation to ${destinationName}`)
  }, [speakInstruction])

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
      routeData: null,
      bearing: 0
    }))
    
    // Clear route recomputation timer
    if (routeRecomputeTimerRef.current) {
      clearTimeout(routeRecomputeTimerRef.current)
      routeRecomputeTimerRef.current = null
    }
    
    // Speak navigation end
    speakInstruction('Navigation ended')
  }, [speakInstruction])

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

  return {
    currentLocation,
    locationPermission,
    locationError,
    navigationState,
    startLocationTracking,
    stopLocationTracking,
    startNavigation,
    stopNavigation,
    updateNavigationState,
    toggleVoiceNavigation,
    speakInstruction
  }
}