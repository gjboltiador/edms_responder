"use client"

import dynamic from 'next/dynamic'

// Dynamically import the MapView component with no SSR
const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-b-lg bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

export default function Map() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map View</h1>
      <MapView
        currentLocation={[14.5995, 120.9842]} // Default to Manila coordinates
        destination={[14.5995, 120.9842]}
        destinationName="Current Location"
        severity="low"
      />
    </div>
  );
} 