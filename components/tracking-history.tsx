"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin } from "lucide-react"

interface TrackingHistoryProps {
  dispatch_id: number
}

interface GpsRecord {
  id: number
  dispatch_id: number
  lat: string
  lng: string
  latlng: string
  created_date: string
}

export default function TrackingHistory({ dispatch_id }: TrackingHistoryProps) {
  const [history, setHistory] = useState<GpsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/gps?dispatch_id=${dispatch_id}`)
        if (!response.ok) throw new Error('Failed to fetch tracking history')
        const data = await response.json()
        setHistory(data.data)
      } catch (err) {
        setError('Failed to load tracking history')
      } finally {
        setLoading(false)
      }
    }

    if (dispatch_id) {
      fetchHistory()
    }
  }, [dispatch_id])

  if (loading) return <div>Loading history...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Location History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracking history available</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="flex items-start space-x-2 text-sm">
                  <div className="min-w-[16px] mt-0.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">
                      Lat: {record.lat}, Lng: {record.lng}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(record.created_date).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 