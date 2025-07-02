import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const responders = await db.getAvailableResponders()
    return NextResponse.json(responders)
  } catch (error) {
    console.error('Error fetching available responders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available responders' }, 
      { status: 500 }
    )
  }
} 