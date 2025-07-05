"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function LocationTest() {
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking')
  const [locationData, setLocationData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [permissionStatus, setPermissionStatus] = useState<string>('')

  const testLocationAccess = async () => {
    setLocationStatus('checking')
    setErrorMessage('')
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setLocationStatus('error')
        setErrorMessage('Geolocation is not supported by this browser')
        return
      }

      // Check permission status
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionStatus(permission.state)
          
          if (permission.state === 'denied') {
            setLocationStatus('denied')
            setErrorMessage('Location access denied. Please enable location in your browser settings.')
            return
          }
        } catch (permError) {
          console.warn('Permission check failed:', permError)
        }
      }

      // Try to get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('granted')
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toLocaleString()
          })
        },
        (error) => {
          setLocationStatus('error')
          let message = 'Location access error'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please allow location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location unavailable. Please check your GPS signal and try again.'
              break
            case error.TIMEOUT:
              message = 'Location timeout. Please check your GPS signal and try again.'
              break
            default:
              message = error.message || 'Unknown location error'
          }
          
          setErrorMessage(message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } catch (error) {
      setLocationStatus('error')
      setErrorMessage('Failed to test location access')
    }
  }

  useEffect(() => {
    testLocationAccess()
  }, [])

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <MapPin className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (locationStatus) {
      case 'granted':
        return 'text-green-600'
      case 'denied':
        return 'text-red-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            Location Access Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Permission Status</h3>
            <Badge variant={permissionStatus === 'granted' ? 'default' : 'secondary'}>
              {permissionStatus || 'Unknown'}
            </Badge>
          </div>

          {/* Location Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Location Status</h3>
            <Badge variant={locationStatus === 'granted' ? 'default' : 'destructive'}>
              {locationStatus === 'checking' ? 'Checking...' : locationStatus}
            </Badge>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Location Data */}
          {locationData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="font-semibold text-green-900 mb-2">Location Data</h3>
              <div className="text-sm text-green-800 space-y-1">
                <div>Latitude: {locationData.latitude.toFixed(6)}</div>
                <div>Longitude: {locationData.longitude.toFixed(6)}</div>
                <div>Accuracy: {locationData.accuracy.toFixed(0)}m</div>
                {locationData.heading && <div>Heading: {locationData.heading.toFixed(0)}°</div>}
                {locationData.speed && <div>Speed: {locationData.speed.toFixed(1)}m/s</div>}
                <div>Time: {locationData.timestamp}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={testLocationAccess} className="flex-1">
              Test Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/map'}
              className="flex-1"
            >
              Go to Map
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-blue-900 mb-2">How to Fix Location Issues</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. Click the lock/shield icon in your browser's address bar</div>
              <div>2. Find "Location" in the permissions list</div>
              <div>3. Change it from "Block" to "Allow"</div>
              <div>4. Refresh this page and test again</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 