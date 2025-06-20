import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { alertId, responderId, assignedBy } = await request.json()
    
    // Validate required fields
    if (!alertId || !responderId) {
      return NextResponse.json(
        { error: 'Alert ID and Responder ID are required' }, 
        { status: 400 }
      )
    }

    // Validate data types
    const alertIdNum = parseInt(alertId)
    const responderIdNum = parseInt(responderId)
    
    if (isNaN(alertIdNum) || isNaN(responderIdNum)) {
      return NextResponse.json(
        { error: 'Invalid Alert ID or Responder ID format' }, 
        { status: 400 }
      )
    }

    // Assign responder to alert
    const result = await db.assignResponderToAlert(alertIdNum, responderIdNum, assignedBy)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error assigning responder to alert:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign responder' }, 
      { status: 500 }
    )
  }
} 