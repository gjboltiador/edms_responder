import { NextRequest, NextResponse } from 'next/server'
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
  responder_id?: number
  responder_name?: string
  responder_username?: string
  assigned_at?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const responderId = searchParams.get('responderId')
    const unassigned = searchParams.get('unassigned')
    
    let alerts: Alert[]
    
    if (unassigned === 'true') {
      alerts = await db.getUnassignedAlerts() as Alert[]
    } else if (status) {
      alerts = await db.getAlertsByStatus(status) as Alert[]
    } else if (responderId) {
      const responderIdNum = parseInt(responderId)
      if (isNaN(responderIdNum)) {
        return NextResponse.json(
          { error: 'Invalid responder ID format' }, 
          { status: 400 }
        )
      }
      alerts = await db.getAlertsByResponder(responderIdNum) as Alert[]
    } else {
      alerts = await db.getAlerts() as Alert[]
    }
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { alertId, status, responderId } = await request.json()
    
    // If responderId is provided, update the alert with responder assignment
    if (responderId) {
      await db.updateAlertStatusWithResponder(alertId, status, responderId)
    } else {
      await db.updateAlertStatus(alertId, status)
    }
    
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