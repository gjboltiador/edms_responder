import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Alert {
  id: number
  type: string
  location: string
  description: string
  severity: string
  status: string
  created_at: string
  latitude: number
  longitude: number
}

export async function GET() {
  try {
    const alerts = await db.getAlerts() as Alert[]
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { alertId, status } = await request.json()
    
    await db.updateAlertStatus(alertId, status)
    const alerts = await db.getAlerts() as Alert[]
    const updatedAlert = alerts.find(alert => alert.id === alertId)
    
    if (!updatedAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedAlert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
} 