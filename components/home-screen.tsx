"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Radio, FileText, AlertTriangle, User, Home } from "lucide-react"
import { useState, useEffect } from "react"

interface HomeScreenProps {
  userName: string;
  onNavigate: (tab: string) => void;
}

interface Alert {
  id: number;
  type: string;
  location: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
}

export default function HomeScreen({ userName, onNavigate }: HomeScreenProps) {
  const [activeEmergencies, setActiveEmergencies] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("Available")

  useEffect(() => {
    loadActiveEmergencies()
  }, [])

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
    onNavigate('dispatch')
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4">
      {/* Profile Section */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{userName}</h2>
            <Badge
              variant="default"
              className={status === "Available" ? "bg-emerald-500 text-xs" : "bg-red-500 text-xs"}
            >
              {status}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-xl border-slate-200 text-sm h-9 px-4"
          onClick={() => setStatus(status === "Available" ? "Busy" : "Available")}
        >
          Toggle Status
        </Button>
      </div>

      {/* Active Emergencies Section */}
      <Card className="border-none shadow-sm bg-rose-50 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Active Emergencies</h2>
          </div>
          {!loading && activeEmergencies.length > 0 && (
            <p className="text-sm text-slate-600">
              {activeEmergencies.length} emergencies in your area
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
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToDispatch(emergency.id)}
            >
              <div className="space-y-2">
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-2.5">
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
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button 
            className="flex flex-col items-center gap-1 text-rose-500 px-3"
            onClick={() => onNavigate('home')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-slate-400 px-3"
            onClick={() => onNavigate('dispatch')}
          >
            <Radio className="h-5 w-5" />
            <span className="text-xs">Dispatch</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-slate-400 px-3"
            onClick={() => onNavigate('report')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Report</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-slate-400 px-3"
            onClick={() => onNavigate('sos')}
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">SOS</span>
          </button>
        </div>
      </div>

      {/* Add padding to account for fixed bottom navigation */}
      <div className="h-16"></div>
    </div>
  )
}
