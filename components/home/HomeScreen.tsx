"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Radio, FileText, AlertTriangle, User, Home, CheckCircle, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocationTracking } from "@/hooks/useLocationTracking"
import { useResponderLocationSync } from "@/hooks/useResponderLocationSync"
import { toast } from "@/components/ui/use-toast"

interface HomeScreenProps {
  userName?: string;
  user?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  } | null;
  onNavigate?: (tab: string) => void;
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
  responder_id?: number;
  responder_name?: string;
  responder_username?: string;
  assigned_at?: string;
}

interface Responder {
  id: number;
  username: string;
  name: string;
  status: string;
  active_assignments: number;
  last_active: string;
}

export function HomeScreen({ userName = "User", user, onNavigate = () => {} }: HomeScreenProps) {
  const [activeEmergencies, setActiveEmergencies] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("Available")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [responderId, setResponderId] = useState<number | null>(null)
  const [availableResponders, setAvailableResponders] = useState<Responder[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [alertStats, setAlertStats] = useState({
    total: 0,
    highSeverity: 0,
    pending: 0,
    accepted: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    byType: {} as Record<string, number>
  })

  // Location tracking and sync
  const { currentLocation, locationError, locationPermission } = useLocationTracking()
  
  // Sync location when available and responder ID is known
  useResponderLocationSync({
    responderId: responderId || 0,
    isAvailable: status === "Available" && responderId !== null,
    onError: (error) => {
      console.error('Location sync error:', error)
    }
  })

  useEffect(() => {
    loadActiveEmergencies()
    loadResponderStatus()
    loadAvailableResponders()
  }, [user])

  const loadResponderStatus = async () => {
    try {
      // Use the actual logged-in user's username
      const username = user?.username || userName;
      if (!username) {
        console.log('No username available for responder lookup');
        setResponderId(null);
        return;
      }

      // Try to get the responder by username
      const response = await fetch(`/api/responder/status?username=${encodeURIComponent(username)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setResponderId(data.id)
          if (data.status) {
            setStatus(data.status)
          }
        }
      } else if (response.status === 404) {
        // Responder not found - user needs to register
        console.log('Responder not found - user needs to register')
        setResponderId(null)
      }
    } catch (error) {
      console.error('Failed to load responder status:', error)
      setResponderId(null)
    }
  }

  const loadAvailableResponders = async () => {
    try {
      const response = await fetch('/api/responders/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableResponders(data)
      }
    } catch (error) {
      console.error('Failed to load available responders:', error)
    }
  }

  const toggleStatus = async () => {
    if (!responderId) {
      toast({
        title: "Not Registered",
        description: "Please register as a responder in the Settings tab first.",
        variant: "destructive",
      })
      return
    }

    const newStatus = status === "Available" ? "Busy" : "Available"
    setIsUpdatingStatus(true)
    
    try {
      // Check if location is required and available
      if (newStatus === "Available" && !currentLocation) {
        toast({
          title: "Location Required",
          description: "Please allow location access to mark yourself as available.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        responderId,
        status: newStatus,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        accuracy: currentLocation?.accuracy || null
      }

      const response = await fetch('/api/responder/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      setStatus(newStatus)
      toast({
        title: "Status Updated",
        description: `You are now ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update your status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const loadActiveEmergencies = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      const data = await response.json()
      // Filter to show only active (pending or accepted) emergencies
      const activeAlerts = data.filter((alert: Alert) => 
        alert.status === 'Pending' || alert.status === 'Accepted'
      )
      setActiveEmergencies(activeAlerts)
      
      // Calculate statistics
      const stats = {
        total: data.length,
        highSeverity: data.filter((a: Alert) => a.severity.toLowerCase() === 'high').length,
        pending: data.filter((a: Alert) => a.status.toLowerCase() === 'pending').length,
        accepted: data.filter((a: Alert) => a.status.toLowerCase() === 'accepted').length,
        assigned: data.filter((a: Alert) => a.status.toLowerCase() === 'assigned').length,
        inProgress: data.filter((a: Alert) => a.status.toLowerCase() === 'in progress').length,
        completed: data.filter((a: Alert) => a.status.toLowerCase() === 'completed').length,
        byType: data.reduce((acc: Record<string, number>, alert: Alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1
          return acc
        }, {})
      }
      setAlertStats(stats)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load emergencies:', err)
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white'
      case 'medium':
        return 'bg-zinc-900 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'text-emerald-600 border-emerald-200'
      case 'pending':
        return 'text-amber-600 border-amber-200'
      default:
        return 'text-slate-600 border-slate-200'
    }
  }

  const navigateToDispatch = (alertId: number) => {
    // Set the alert ID in localStorage for the dispatch screen to read
    localStorage.setItem('selectedAlertId', alertId.toString())
    
    // Show a toast notification to inform the user
    toast({
      title: "Navigating to Dispatch",
      description: "The selected alert will be highlighted in the dispatch screen.",
    })
    
    onNavigate('dispatch')
  }

  const assignResponderToAlert = async (alertId: number, responderId: number) => {
    setIsAssigning(true)
    try {
      const response = await fetch('/api/alerts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, responderId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign responder')
      }

      toast({
        title: "Responder Assigned",
        description: "Responder has been assigned to the alert successfully.",
      })

      // Reload data
      loadActiveEmergencies()
      loadAvailableResponders()
    } catch (error) {
      console.error('Error assigning responder:', error)
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign responder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const acceptAlertAssignment = async (alertId: number) => {
    if (!responderId) return

    try {
      const response = await fetch('/api/alerts/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, responderId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept assignment')
      }

      toast({
        title: "Assignment Accepted",
        description: "You have accepted the alert assignment.",
      })

      loadActiveEmergencies()
    } catch (error) {
      console.error('Error accepting assignment:', error)
      toast({
        title: "Acceptance Failed",
        description: error instanceof Error ? error.message : "Failed to accept assignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const completeAlert = async (alertId: number) => {
    if (!responderId) return

    try {
      const response = await fetch('/api/alerts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, responderId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete alert')
      }

      toast({
        title: "Alert Completed",
        description: "Alert has been marked as completed.",
      })

      loadActiveEmergencies()
      loadAvailableResponders()
    } catch (error) {
      console.error('Error completing alert:', error)
      toast({
        title: "Completion Failed",
        description: error instanceof Error ? error.message : "Failed to complete alert. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4 pb-20">
      {/* Profile Section */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user?.firstname ? `${user.firstname} ${user.lastname}` : userName}
            </h2>
            {responderId ? (
              <>
                <Badge
                  variant="default"
                  className={status === "Available" ? "bg-emerald-500 text-xs" : "bg-red-500 text-xs"}
                >
                  {status}
                </Badge>
                {/* Location status indicator */}
                {status === "Available" && currentLocation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Location tracked ({currentLocation.accuracy.toFixed(0)}m accuracy)
                  </p>
                )}
                {status === "Available" && locationError && (
                  <p className="text-xs text-red-500 mt-1">
                    Location error: {locationError}
                  </p>
                )}
              </>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                Not Registered
              </Badge>
            )}
            {/* Connection status */}
            <div className="flex items-center gap-1 mt-1">
              {navigator.onLine ? (
                <>
                  <Wifi className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        {responderId ? (
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl border-slate-200 text-sm h-9 px-4"
            onClick={toggleStatus}
            disabled={isUpdatingStatus || (status === "Available" && locationPermission === 'denied')}
          >
            {isUpdatingStatus ? "Updating..." : "Toggle Status"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl border-amber-200 text-amber-600 text-sm h-9 px-4"
            onClick={() => onNavigate('settings')}
          >
            Register
          </Button>
        )}
      </div>

      {/* Alert Statistics Section */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-medium">Total Alerts</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{alertStats.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-medium">High Severity</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{alertStats.highSeverity}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Clock className="h-5 w-5" />
              <h3 className="text-sm font-medium">Pending</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{alertStats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <h3 className="text-sm font-medium">Accepted</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{alertStats.accepted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Type Distribution */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Alert Distribution</h3>
          <div className="space-y-2">
            {Object.entries(alertStats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{type}</span>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Responders Section */}
      {availableResponders.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-3">
              <User className="h-5 w-5" />
              <h3 className="text-sm font-medium">Available Responders</h3>
              <Badge variant="secondary" className="text-xs">
                {availableResponders.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {availableResponders.slice(0, 3).map((responder) => (
                <div key={responder.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{responder.name}</p>
                      <p className="text-xs text-slate-500">
                        {responder.active_assignments} active • Last active: {new Date(responder.last_active).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                    Available
                  </Badge>
                </div>
              ))}
              {availableResponders.length > 3 && (
                <p className="text-xs text-slate-500 text-center">
                  +{availableResponders.length - 3} more available responders
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Emergencies Section */}
      <Card className="border-none shadow-sm bg-rose-50 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Active Emergencies</h2>
          </div>
          {!loading && activeEmergencies.length > 0 && (
            <p className="text-sm text-slate-600">
              {activeEmergencies.length} emergencies requiring attention
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-6 text-slate-500 text-sm">Loading emergencies...</div>
        ) : activeEmergencies.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No active emergencies at the moment.
          </div>
        ) : (
          activeEmergencies.map((emergency) => (
            <div 
              key={emergency.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 truncate">{emergency.type}</h3>
                  </div>
                  <Badge className={`${getSeverityColor(emergency.severity)} px-2.5 py-0.5 text-xs rounded-full flex-shrink-0`}>
                    {emergency.severity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm truncate">{emergency.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(emergency.created_at).toLocaleString()}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 border ${getStatusColor(emergency.status)} flex-shrink-0`}
                  >
                    {emergency.status}
                  </Badge>
                </div>

                {/* Assignment Information */}
                {emergency.responder_id && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <User className="h-3 w-3" />
                    <span>Assigned to: {emergency.responder_name || emergency.responder_username}</span>
                    {emergency.assigned_at && (
                      <span className="text-slate-400">
                        • {new Date(emergency.assigned_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {/* Dispatch Button */}
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigateToDispatch(emergency.id)}
                  >
                    <Radio className="h-3 w-3 mr-1" />
                    Dispatch
                  </Button>

                  {/* Assignment Actions - HIDDEN */}
                  {/* {!emergency.responder_id && responderId && status === "Available" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => assignResponderToAlert(emergency.id, responderId)}
                      disabled={isAssigning}
                    >
                      {isAssigning ? "Assigning..." : "Take Alert"}
                    </Button>
                  )}

                  {emergency.responder_id === responderId && emergency.status === "Assigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => acceptAlertAssignment(emergency.id)}
                    >
                      Accept
                    </Button>
                  )}

                  {emergency.responder_id === responderId && emergency.status === "In Progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => completeAlert(emergency.id)}
                    >
                      Complete
                    </Button>
                  )}

                  {!emergency.responder_id && availableResponders.length > 0 && (
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const responder = availableResponders[0]
                          assignResponderToAlert(emergency.id, responder.id)
                        }}
                        disabled={isAssigning}
                      >
                        {isAssigning ? "Assigning..." : "Assign"}
                      </Button>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions Grid */}
      {/*<div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          className="h-[72px] rounded-2xl border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 p-0"
          onClick={() => onNavigate('dispatch')}
        >
          <Radio className="h-5 w-5 text-slate-600" />
          <span className="text-sm">Dispatch</span>
        </Button>
        <Button
          variant="outline"
          className="h-[72px] rounded-2xl border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 p-0"
          onClick={() => onNavigate('report')}
        >
          <FileText className="h-5 w-5 text-slate-600" />
          <span className="text-sm">Reports</span>
        </Button>
        <Button
          variant="outline"
          className="h-[72px] rounded-2xl border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 p-0"
          onClick={() => onNavigate('map')}
        >
          <MapPin className="h-5 w-5 text-slate-600" />
          <span className="text-sm">Map View</span>
        </Button>
        <Button
          variant="outline"
          className="h-[72px] rounded-2xl bg-red-500 hover:bg-red-600 border-0 text-white flex flex-col items-center justify-center gap-1.5 p-0"
          onClick={() => onNavigate('sos')}
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">SOS</span>
        </Button>
      </div>*/}
    </div>
  )
} 