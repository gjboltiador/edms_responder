"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@/app/map.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
const createIcon = (color: string) => L.icon({
  iconUrl: '/images/marker-icon.svg',
  shadowUrl: '/images/marker-shadow.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: `custom-marker-${color}`
})

// Set the default icon for all markers
if (typeof window !== 'undefined') {
  L.Marker.prototype.options.icon = createIcon('blue')
}

interface MapComponentProps {
  currentLocation: [number, number]
  destination: [number, number]
  location: string
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

export default function MapComponent({ currentLocation, destination, location }: MapComponentProps) {
  return (
    <div className="w-full h-[400px] rounded-b-lg bg-slate-100 relative">
      <MapContainer
        center={currentLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={currentLocation} icon={createIcon('blue')}>
          <Popup>Your Location</Popup>
        </Marker>
        <Marker position={destination} icon={createIcon('red')}>
          <Popup>{location}</Popup>
        </Marker>
        <MapBounds currentLocation={currentLocation} destination={destination} />
        <RouteVisualization currentLocation={currentLocation} destination={destination} />
      </MapContainer>
    </div>
  )
} 