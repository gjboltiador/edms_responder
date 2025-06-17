"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Phone, User } from "lucide-react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function SosScreen() {
  const [sosActive, setSosActive] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [helpRequested, setHelpRequested] = useState(false)

  const activateSOS = () => {
    setSosActive(true)

    // Simulate countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setHelpRequested(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const cancelSOS = () => {
    setSosActive(false)
    setCountdown(3)
    setHelpRequested(false)
  }

  return (
    <div className="space-y-6 pb-16">
      <h2 className="text-xl font-bold">Emergency SOS</h2>

      {!sosActive && !helpRequested ? (
        <div className="space-y-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Emergency SOS
              </CardTitle>
              <CardDescription>Press and hold the SOS button to activate emergency protocol</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                This will alert all nearby responders and dispatch center of your emergency situation.
              </p>
              <div className="flex justify-center">
                <Button
                  className="h-32 w-32 rounded-full bg-red-600 hover:bg-red-700 text-lg font-bold"
                  onClick={activateSOS}
                >
                  SOS
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Dispatch Center</span>
                </div>
                <Button size="sm" variant="outline" className="h-8">
                  <Phone className="h-4 w-4 mr-1" /> Call
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Team Supervisor</span>
                </div>
                <Button size="sm" variant="outline" className="h-8">
                  <Phone className="h-4 w-4 mr-1" /> Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : sosActive && !helpRequested ? (
        <Card className="border-red-500 bg-red-100">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">SOS Activating...</CardTitle>
            <CardDescription>Sending emergency alert in {countdown} seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(3 - countdown) * 33.3} className="h-2 mb-6" />
            <p className="text-sm mb-4 text-center">Press cancel to stop the emergency alert</p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full" onClick={cancelSOS}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-red-500 bg-red-100">
            <CardHeader className="bg-red-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  SOS ACTIVE
                </CardTitle>
                <Badge variant="outline" className="bg-white text-red-600">
                  LIVE
                </Badge>
              </div>
              <CardDescription className="text-red-100">Help is on the way</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Your location is being tracked</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Current location
                  </div>
                </div>

                <div className="border rounded-md p-3 bg-white">
                  <h3 className="font-medium text-sm">Response Status</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nearest responder:</span>
                      <span className="font-medium">2 min away</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical team:</span>
                      <span className="font-medium">Dispatched</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-red-500 text-red-600" onClick={cancelSOS}>
                Cancel Emergency
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" /> Call Dispatch Center
                </Button>
                <Button variant="outline" className="w-full">
                  Send Status Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
