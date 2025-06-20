import { useEffect, useRef } from 'react'
import { useLocationTracking } from './useLocationTracking'

interface UseResponderLocationSyncProps {
  responderId: number
  isAvailable: boolean
  onError?: (error: string) => void
}

export function useResponderLocationSync({ 
  responderId, 
  isAvailable, 
  onError 
}: UseResponderLocationSyncProps) {
  const { currentLocation } = useLocationTracking()
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAvailable || !currentLocation) {
      // Clear interval if not available or no location
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
      return
    }

    // Function to update location
    const updateLocation = async () => {
      try {
        const response = await fetch('/api/responder/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responderId,
            status: 'Available',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update location')
        }

        console.log('Location synced successfully')
      } catch (error) {
        console.error('Failed to sync location:', error)
        onError?.(error instanceof Error ? error.message : 'Location sync failed')
      }
    }

    // Initial update
    updateLocation()

    // Set up periodic updates every 30 seconds
    updateIntervalRef.current = setInterval(updateLocation, 30000)

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [responderId, isAvailable, currentLocation, onError])

  return { currentLocation }
} 