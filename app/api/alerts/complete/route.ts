import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { alertId, responderId } = await request.json()
    
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

    // Complete alert
    const result = await db.completeAlert(alertIdNum, responderIdNum)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error completing alert:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete alert' }, 
      { status: 500 }
    )
  }
} 