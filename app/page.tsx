"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DispatchAlertScreen from "@/components/dispatch-alert-screen"
import SettingsScreen from "@/components/settings-screen"
import LoginScreen from "@/components/login-screen"
import { AlertTriangle, FileText, Home, Radio, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, MountainIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Bell, Phone, User } from "lucide-react"
import { ReportScreen } from "@/components/reports/ReportScreen"
import { HomeScreen } from '@/components/home/HomeScreen'

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
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

export default function EmergencyResponderApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("home")
  const [activeEmergencies, setActiveEmergencies] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const router = useRouter()

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setActiveTab("home")
  }

  const navigateToTab = (tab: string) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    loadActiveEmergencies()
    fetchAlerts()
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

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const handleAcceptAlert = async (alertId: number) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status: 'accepted'
        }),
      })
      if (!response.ok) throw new Error('Failed to update alert')
      await fetchAlerts() // Refresh alerts after update
    } catch (error) {
      console.error('Error accepting alert:', error)
    }
  }

  const handleDeclineAlert = async (alertId: number) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status: 'declined'
        }),
      })
      if (!response.ok) throw new Error('Failed to update alert')
      await fetchAlerts() // Refresh alerts after update
    } catch (error) {
      console.error('Error declining alert:', error)
    }
  }

  const handleCompleteAlert = (alert: Alert) => {
    setSelectedAlert(alert)
    setActiveTab("report")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const navigateToDispatch = (alertId: number) => {
    router.push(`/dispatch?alert=${alertId}`)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-red-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">EDMS Responder</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.firstname}</span>
            <button onClick={handleLogout} className="text-sm bg-red-700 px-3 py-1 rounded-md hover:bg-red-800">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home">
            <HomeScreen 
              userName={user?.username || user?.firstname || "User"} 
              user={user}
              onNavigate={navigateToTab}
            />
          </TabsContent>
          <TabsContent value="dispatch">
            <DispatchAlertScreen 
              setActiveTab={setActiveTab} 
              setSelectedAlert={setSelectedAlert}
              user={user}
            />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsScreen user={user} />
          </TabsContent>
          <TabsContent value="report">
            <ReportScreen selectedAlert={selectedAlert} setSelectedAlert={setSelectedAlert} />
          </TabsContent>
          <TabsList className="fixed bottom-0 left-0 right-0 h-16 grid grid-cols-4 bg-white border-t border-gray-200">
            <TabsTrigger
              value="home"
              className="flex flex-col items-center justify-center data-[state=active]:text-red-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="dispatch"
              className="flex flex-col items-center justify-center data-[state=active]:text-red-600"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Dispatch</span>
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex flex-col items-center justify-center data-[state=active]:text-red-600"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">Report</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-col items-center justify-center data-[state=active]:text-red-600"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>
    </div>
  )
}
