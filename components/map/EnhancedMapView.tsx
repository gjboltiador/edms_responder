"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@/app/map.css'
import L from 'leaflet'

// Function to generate SVG content for the marker icon with a specific color
const getMarkerSvg = (color: string) => `
  <svg width="25px" height="41px" viewBox="0 0 25 41" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <path class="marker-path" d="M12.5,0 C5.59644063,0 0,5.59644063 0,12.5 C0,19.4035594 12.5,41 12.5,41 C12.5,41 25,19.4035594 25,12.5 C25,5.59644063 19.4035594,0 12.5,0 Z" fill="${color}" fill-rule="nonzero"></path>
          <circle fill="#FFFFFF" fill-rule="nonzero" cx="12.5" cy="12.5" r="5.5"></circle>
      </g>
  </svg>
`

// Function to create a custom divIcon with a specific color
const createColoredIcon = (color: string) => {
  const svgString = getMarkerSvg(color)
  return L.divIcon({
    html: svgString,
    className: 'custom-div-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// Function to get marker color based on severity
const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'high':
      return '#ef4444' // Red
    case 'medium':
      return '#f97316' // Orange
    case 'low':
      return '#22c55e' // Green
    default:
      return '#3b82f6' // Blue
  }
}

// Check if component is inside a modal
const isInModal = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check if we're in a modal by looking for modal-related classes or data attributes
  const modalSelectors = [
    '[role="dialog"]',
    '[data-modal="true"]',
    '.modal',
    '.dialog',
    '[aria-modal="true"]',
    '.fixed.inset-0.z-50', // Common dialog backdrop
    '[data-radix-dialog-content]' // Radix UI dialog
  ]
  
  // Check if any parent element matches modal selectors
  let element = document.activeElement || document.body
  while (element && element !== document.body) {
    for (const selector of modalSelectors) {
      if (element.matches(selector)) {
        return true
      }
    }
    element = element.parentElement
  }
  
  // Also check if we're inside a dialog by looking at the component's container
  const mapContainer = document.querySelector('.leaflet-container')
  if (mapContainer) {
    let parent = mapContainer.parentElement
    while (parent && parent !== document.body) {
      for (const selector of modalSelectors) {
        if (parent.matches(selector)) {
          return true
        }
      }
      parent = parent.parentElement
    }
  }
  
  return false
}

// Offline map tile cache
class OfflineTileCache {
  private cache: Map<string, string> = new Map()
  private readonly CACHE_SIZE = 1000 // Maximum number of cached tiles

  async getTile(url: string): Promise<string | null> {
    return this.cache.get(url) || null
  }

  async setTile(url: string, dataUrl: string): Promise<void> {
    if (this.cache.size >= this.CACHE_SIZE) {
      // Remove oldest entries
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(url, dataUrl)
  }

  async preloadTiles(center: [number, number], zoom: number, radius: number = 2): Promise<void> {
    const tiles: string[] = []
    const subdomains = ['a', 'b', 'c'] // OpenStreetMap subdomains for load balancing
    
    for (let z = Math.max(0, zoom - 1); z <= Math.min(18, zoom + 1); z++) {
      const tileSize = 256
      const scale = Math.pow(2, z)
      const worldSize = tileSize * scale
      
      const lat = center[0]
      const lng = center[1]
      
      const x = Math.floor((lng + 180) / 360 * scale)
      const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale)
      
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const tileX = x + dx
          const tileY = y + dy
          
          // Use different subdomains for load balancing
          const subdomain = subdomains[Math.abs(tileX + tileY) % subdomains.length]
          const url = `https://${subdomain}.tile.openstreetmap.org/${z}/${tileX}/${tileY}.png`
          tiles.push(url)
        }
      }
    }

    // Preload tiles in background
    tiles.forEach(url => {
      this.preloadTile(url)
    })
  }

  private async preloadTile(url: string): Promise<void> {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const dataUrl = URL.createObjectURL(blob)
        await this.setTile(url, dataUrl)
      }
    } catch (error) {
      console.warn('Failed to preload tile:', url, error)
    }
  }
}

// Offline routing cache
class OfflineRoutingCache {
  private cache: Map<string, any> = new Map()
  private readonly CACHE_SIZE = 100

  async getRoute(origin: [number, number], destination: [number, number]): Promise<any | null> {
    const key = `${origin[0]},${origin[1]}-${destination[0]},${destination[1]}`
    return this.cache.get(key) || null
  }

  async setRoute(origin: [number, number], destination: [number, number], route: any): Promise<void> {
    if (this.cache.size >= this.CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    const key = `${origin[0]},${origin[1]}-${destination[0]},${destination[1]}`
    this.cache.set(key, route)
  }
}

// Component to handle map bounds and auto-follow
const MapController = ({ 
  currentLocation, 
  destination, 
  isNavigating, 
  autoFollow,
  isModal 
}: { 
  currentLocation: [number, number]
  destination: [number, number]
  isNavigating: boolean
  autoFollow: boolean
  isModal: boolean
}) => {
  const map = useMap()

  useEffect(() => {
    if (isNavigating && autoFollow) {
      // Follow current location during navigation
      map.setView(currentLocation, isModal ? 14 : 16)
    } else if (currentLocation && destination) {
      // Show both locations when not navigating
      const bounds = L.latLngBounds([currentLocation, destination])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [currentLocation, destination, isNavigating, autoFollow, map, isModal])

  return null
}

// Component to handle route visualization with offline support and recomputation
const RouteVisualization = ({ 
  currentLocation, 
  destination, 
  isOnline,
  isNavigating,
  onRouteUpdate,
  onRouteRecompute 
}: { 
  currentLocation: [number, number]
  destination: [number, number]
  isOnline: boolean
  isNavigating: boolean
  onRouteUpdate: (routeData: any) => void
  onRouteRecompute: () => void
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
  const [routeData, setRouteData] = useState<any>(null)
  const [lastRecomputeTime, setLastRecomputeTime] = useState<number>(0)
  const routingCache = useRef(new OfflineRoutingCache())
  const recomputeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRoute = useCallback(async (forceRecompute = false) => {
    try {
      const now = Date.now()
      
      // Don't recompute too frequently (minimum 30 seconds between recomputations)
      if (!forceRecompute && now - lastRecomputeTime < 30000) {
        return
      }

      // Try cache first (unless forcing recompute)
      if (!forceRecompute) {
        const cachedRoute = await routingCache.current.getRoute(currentLocation, destination)
        if (cachedRoute) {
          setRouteCoordinates(cachedRoute.coordinates)
          setRouteData(cachedRoute)
          onRouteUpdate(cachedRoute)
          return
        }
      }

      if (!isOnline) {
        console.warn('Offline mode: Using cached route or showing direct path')
        // Show direct path when offline and no cached route
        setRouteCoordinates([currentLocation, destination])
        return
      }

      console.log('Fetching new route...')
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
      )
      const data = await response.json()
      
      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
        const routeInfo = {
          coordinates,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          steps: data.routes[0].legs[0].steps
        }
        
        setRouteCoordinates(coordinates)
        setRouteData(routeInfo)
        onRouteUpdate(routeInfo)
        setLastRecomputeTime(now)
        
        // Cache the route
        await routingCache.current.setRoute(currentLocation, destination, routeInfo)
      }
    } catch (error) {
      console.error('Error fetching route:', error)
      // Fallback to direct path
      setRouteCoordinates([currentLocation, destination])
    }
  }, [currentLocation, destination, isOnline, onRouteUpdate, lastRecomputeTime])

  // Set up automatic route recomputation during navigation
  useEffect(() => {
    if (isNavigating) {
      // Clear existing timer
      if (recomputeTimerRef.current) {
        clearTimeout(recomputeTimerRef.current)
      }
      
      // Set up periodic route recomputation (every 30 seconds)
      recomputeTimerRef.current = setInterval(() => {
        console.log('Auto route recomputation triggered')
        fetchRoute(true)
        onRouteRecompute()
      }, 30000)
    } else {
      // Clear timer when not navigating
      if (recomputeTimerRef.current) {
        clearTimeout(recomputeTimerRef.current)
        recomputeTimerRef.current = null
      }
    }

    return () => {
      if (recomputeTimerRef.current) {
        clearTimeout(recomputeTimerRef.current)
        recomputeTimerRef.current = null
      }
    }
  }, [isNavigating, fetchRoute, onRouteRecompute])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  if (routeCoordinates.length === 0) return null

  return (
    <Polyline
      positions={routeCoordinates}
      color="#3b82f6"
      weight={4}
      opacity={0.7}
    />
  )
}



// Component for bearing indicator
const BearingIndicator = ({ 
  bearing, 
  isModal 
}: { 
  bearing: number
  isModal: boolean
}) => {
  return (
    <div className={`bearing-indicator ${isModal ? 'modal-bearing-indicator' : ''}`}>
      <div 
        className="bearing-arrow"
        style={{ transform: `rotate(${bearing}deg)` }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div className="bearing-text">
        {Math.round(bearing)}°
      </div>
    </div>
  )
}

// Component for turn-by-turn navigation with voice support
const TurnByTurnNavigation = ({ 
  currentLocation, 
  destination, 
  routeData,
  bearing,
  isModal,
  onSpeakInstruction 
}: { 
  currentLocation: [number, number]
  destination: [number, number]
  routeData: any
  bearing: number
  isModal: boolean
  onSpeakInstruction: (text: string) => void
}) => {
  const [currentStep, setCurrentStep] = useState<any>(null)
  const [distanceToNext, setDistanceToNext] = useState<number>(0)
  const [lastSpokenInstruction, setLastSpokenInstruction] = useState<string>('')

  useEffect(() => {
    if (!routeData?.steps) return

    // Find current step based on location
    const currentStepIndex = routeData.steps.findIndex((step: any) => {
      const stepLocation = step.maneuver.location
      const distance = L.latLng(currentLocation[0], currentLocation[1])
        .distanceTo(L.latLng(stepLocation[1], stepLocation[0]))
      return distance < 50 // Within 50 meters of step
    })

    if (currentStepIndex >= 0) {
      const step = routeData.steps[currentStepIndex]
      setCurrentStep(step)
      
      // Calculate distance to next step
      if (currentStepIndex < routeData.steps.length - 1) {
        const nextStep = routeData.steps[currentStepIndex + 1]
        const distance = L.latLng(currentLocation[0], currentLocation[1])
          .distanceTo(L.latLng(nextStep.maneuver.location[1], nextStep.maneuver.location[0]))
        setDistanceToNext(distance)
      }

      // Speak instruction if it's new and within speaking distance
      const instruction = step.maneuver.instruction
      if (instruction !== lastSpokenInstruction && distanceToNext < 200) {
        setLastSpokenInstruction(instruction)
        onSpeakInstruction(instruction)
      }
    }
  }, [currentLocation, routeData, distanceToNext, lastSpokenInstruction, onSpeakInstruction])

  if (!currentStep) return null

  return (
    <div className={`turn-by-turn ${isModal ? 'modal-turn-by-turn' : ''}`}>
      <div className="flex items-center gap-3">
        <BearingIndicator bearing={bearing} isModal={isModal} />
        <div className="flex-1">
          <div className="text-lg font-semibold">
            {currentStep.maneuver.instruction}
          </div>
          <div className="text-sm text-gray-600">
            {distanceToNext > 0 ? `${Math.round(distanceToNext)}m` : 'Arriving'}
          </div>
        </div>
      </div>
    </div>
  )
}

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

interface EnhancedMapViewProps {
  currentLocation: [number, number]
  destination: [number, number]
  destinationName: string
  severity: string
  isNavigating: boolean
  isOnline: boolean
  onNavigationUpdate: (updates: any) => void
  className?: string
  alert?: Alert
}

export default function EnhancedMapView({ 
  currentLocation, 
  destination, 
  destinationName, 
  severity, 
  isNavigating,
  isOnline,
  onNavigationUpdate,
  className = "",
  alert
}: EnhancedMapViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<any>(null)
  const [autoFollow, setAutoFollow] = useState(true)
  const [isModal, setIsModal] = useState(false)
  const tileCache = useRef(new OfflineTileCache())
  const destinationMarkerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(false)
      setIsModal(isInModal())
    }
  }, [])

  // Check if component is in modal on mount and when className changes
  useEffect(() => {
    const checkModal = () => {
      const modal = isInModal()
      setIsModal(modal)
      
      // Add data attribute to map container for CSS targeting
      if (mapContainerRef.current) {
        if (modal) {
          mapContainerRef.current.setAttribute('data-in-modal', 'true')
        } else {
          mapContainerRef.current.removeAttribute('data-in-modal')
        }
      }
    }

    checkModal()
    
    // Check again after a short delay to catch dynamic modal creation
    const timer = setTimeout(checkModal, 100)
    return () => clearTimeout(timer)
  }, [className])

  // Preload tiles for offline use
  useEffect(() => {
    if (currentLocation && isOnline) {
      const zoomLevel = isModal ? 14 : 16
      tileCache.current.preloadTiles(currentLocation, zoomLevel, 3)
    }
  }, [currentLocation, isOnline, isModal])

  // Handle destination marker popup
  useEffect(() => {
    if (destinationMarkerRef.current && destinationName) {
      destinationMarkerRef.current.bindPopup(destinationName)
      
      const markerElement = destinationMarkerRef.current.getElement()
      if (markerElement) {
        markerElement.style.pointerEvents = 'auto'
        markerElement.style.cursor = 'pointer'
        const clickHandler = () => {
          destinationMarkerRef.current?.openPopup()
        }
        markerElement.addEventListener('click', clickHandler)

        return () => {
          markerElement.removeEventListener('click', clickHandler)
        }
      }
    }
  }, [destinationMarkerRef.current, destinationName])

  const handleRouteUpdate = useCallback((updates: any) => {
    setRouteData(updates)
    onNavigationUpdate({
      estimatedTime: updates.duration ? `${Math.round(updates.duration / 60)} min` : '',
      distance: updates.distance ? `${(updates.distance / 1000).toFixed(1)} km` : '',
      currentStep: updates.steps?.[0]?.maneuver?.instruction || ''
    })
  }, [onNavigationUpdate])

  if (isLoading) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!currentLocation || !destination) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Waiting for location data...</p>
      </div>
    )
  }

  const destinationColor = getSeverityColor(severity)
  const containerClass = isModal ? 'modal-map-container' : 'map-container'

  return (
    <div className={`${containerClass} ${className}`} ref={mapContainerRef}>
      <MapContainer
        center={currentLocation}
        zoom={isModal ? 14 : 16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className={isModal ? 'modal-map' : 'fullscreen-map'}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isOnline 
            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          }
        />
        
        {/* Current location marker with accuracy circle */}
        <Marker position={currentLocation} icon={createColoredIcon('#3b82f6')}>
          <Popup>Your Location</Popup>
        </Marker>
        <Circle 
          center={currentLocation} 
          radius={10} 
          color="#3b82f6" 
          fillColor="#3b82f6" 
          fillOpacity={0.2} 
        />
        
        {/* Destination marker */}
        <Marker
          position={destination}
          icon={createColoredIcon(destinationColor)}
          ref={destinationMarkerRef}
        />
        
        {/* Route visualization */}
        <RouteVisualization 
          currentLocation={currentLocation}
          destination={destination}
          isOnline={isOnline}
          isNavigating={isNavigating}
          onRouteUpdate={handleRouteUpdate}
          onRouteRecompute={() => console.log('Route recomputation requested')}
        />
        
        {/* Map controller */}
        <MapController 
          currentLocation={currentLocation}
          destination={destination}
          isNavigating={isNavigating}
          autoFollow={autoFollow}
          isModal={isModal}
        />
      </MapContainer>



      {/* Turn-by-turn navigation overlay */}
      {isNavigating && routeData && (
        <TurnByTurnNavigation 
          currentLocation={currentLocation}
          destination={destination}
          routeData={routeData}
          bearing={0} // This will be updated with actual bearing from navigation state
          isModal={isModal}
          onSpeakInstruction={(text) => console.log('Voice instruction:', text)}
        />
      )}

      {/* Map controls */}
      <div className={`map-controls ${isModal ? 'modal-controls' : ''}`}>
        <button
          onClick={() => setAutoFollow(!autoFollow)}
          className={`map-control-button ${autoFollow ? 'active' : ''}`}
          title={autoFollow ? 'Auto-follow enabled' : 'Auto-follow disabled'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            const mapElement = document.querySelector('.leaflet-container')
            if (mapElement && (mapElement as any)._leaflet_map) {
              const map = (mapElement as any)._leaflet_map
              map.setView(currentLocation, isModal ? 14 : 16)
            }
          }}
          className="map-control-button"
          title="Center on my location"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className={`offline-indicator ${isModal ? 'modal-offline-indicator' : ''}`}>
          Offline Mode
        </div>
      )}
    </div>
  )
} 