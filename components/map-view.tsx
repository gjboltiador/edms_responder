"use client"

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
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
`;

// Function to create a custom divIcon with a specific color
const createColoredIcon = (color: string) => {
  const svgString = getMarkerSvg(color); // Get SVG with the desired color

  return L.divIcon({
    html: svgString,
    className: 'custom-div-icon', // Use a unique class for potential custom styling if needed
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

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

// Component to handle map bounds
const MapBounds = ({ currentLocation, destination }: { currentLocation: [number, number], destination: [number, number] }) => {
  const map = useMap()

  useEffect(() => {
    if (currentLocation && destination) {
      const bounds = L.latLngBounds([currentLocation, destination])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [currentLocation, destination, map])

  return null
}

// Component to handle route visualization
const RouteVisualization = ({ currentLocation, destination }: { currentLocation: [number, number], destination: [number, number] }) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
        )
        const data = await response.json()
        
        if (data.routes && data.routes[0]) {
          // Convert GeoJSON coordinates to [lat, lng] format
          const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
          setRouteCoordinates(coordinates)
        }
      } catch (error) {
        console.error('Error fetching route:', error)
      }
    }

    fetchRoute()
  }, [currentLocation, destination])

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

interface MapViewProps {
  currentLocation: [number, number]
  destination: [number, number]
  destinationName: string
  severity: string
}

export default function MapView({ currentLocation, destination, destinationName, severity }: MapViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const destinationMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (destinationMarkerRef.current && destinationName) {
      // Bind popup content
      destinationMarkerRef.current.bindPopup(destinationName);

      // Manually attach click listener to open popup
      const markerElement = destinationMarkerRef.current.getElement(); // Access the DOM element directly
      if (markerElement) {
        markerElement.style.pointerEvents = 'auto'; // Ensure it's clickable
        markerElement.style.cursor = 'pointer';
        const clickHandler = () => {
          destinationMarkerRef.current?.openPopup();
        };
        markerElement.addEventListener('click', clickHandler);

        // Cleanup event listener on unmount or dependency change
        return () => {
          markerElement.removeEventListener('click', clickHandler);
        };
      }
    }
  }, [destinationMarkerRef.current, destinationName]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-b-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-b-lg bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!currentLocation || !destination) {
    return (
      <div className="w-full h-[400px] rounded-b-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Waiting for location data...</p>
      </div>
    )
  }
  
  const destinationColor = getSeverityColor(severity)
  
  return (
    <div className="w-full h-[400px] rounded-b-lg">
      <MapContainer
        center={currentLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={currentLocation} icon={createColoredIcon('#3b82f6')}>
          <Popup>Your Location</Popup>
        </Marker>
        <Marker
          position={destination}
          icon={createColoredIcon(destinationColor)}
          ref={destinationMarkerRef} // Assign ref
        />
        <MapBounds currentLocation={currentLocation} destination={destination} />
        <RouteVisualization currentLocation={currentLocation} destination={destination} />
      </MapContainer>
    </div>
  )
} 