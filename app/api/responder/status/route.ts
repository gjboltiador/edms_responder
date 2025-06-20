import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { responderId, status, latitude, longitude, accuracy } = await request.json()
    
    // Validate required fields
    if (!responderId || !status) {
      return NextResponse.json(
        { error: 'Responder ID and status are required' }, 
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['Available', 'Busy', 'Offline']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Available, Busy, or Offline' }, 
        { status: 400 }
      )
    }

    // Validate location data if provided
    if (latitude !== null && longitude !== null) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { error: 'Invalid latitude value' }, 
          { status: 400 }
        )
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'Invalid longitude value' }, 
          { status: 400 }
        )
      }
    }

    // Update responder status in the database
    const updateSql = `
      UPDATE responders 
      SET status = ?, last_active = NOW() 
      WHERE id = ?
    `
    
    await query(updateSql, [status, responderId])

    // If location data is provided, store it in a separate table
    if (latitude !== null && longitude !== null) {
      // First, let's create a responder_locations table if it doesn't exist
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS responder_locations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          responder_id INT NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          accuracy INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE CASCADE
        )
      `
      
      try {
        await query(createTableSql)
        
        // Insert location data
        const locationSql = `
          INSERT INTO responder_locations (responder_id, latitude, longitude, accuracy)
          VALUES (?, ?, ?, ?)
        `
        
        await query(locationSql, [responderId, latitude, longitude, accuracy])
      } catch (error) {
        console.error('Error creating location table or inserting location:', error)
        // Don't fail the entire request if location storage fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully',
      data: {
        responderId,
        status,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating responder status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const responderId = searchParams.get('responderId')
    const username = searchParams.get('username')
    
    if (!responderId && !username) {
      return NextResponse.json(
        { error: 'Responder ID or username required' }, 
        { status: 400 }
      )
    }

    let queryParams: any[] = []
    let whereClause = ''
    
    if (responderId) {
      whereClause = 'WHERE id = ?'
      queryParams = [responderId]
    } else if (username) {
      whereClause = 'WHERE username = ?'
      queryParams = [username]
    }

    // Get current status from responders table
    const statusSql = `
      SELECT id, username, name, status, last_active 
      FROM responders 
      ${whereClause}
    `
    
    const statusResults = await query<any>(statusSql, queryParams)
    
    if (statusResults.length === 0) {
      return NextResponse.json(
        { error: 'Responder not found' }, 
        { status: 404 }
      )
    }

    // Get latest location if available
    const locationSql = `
      SELECT latitude, longitude, accuracy, created_at
      FROM responder_locations 
      WHERE responder_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    
    let locationData = null
    try {
      const locationResults = await query<any>(locationSql, [statusResults[0].id])
      if (locationResults.length > 0) {
        locationData = locationResults[0]
      }
    } catch (error) {
      console.error('Error fetching location data:', error)
      // Location table might not exist yet, that's okay
    }

    const responderData = statusResults[0] as any
    
    return NextResponse.json({
      ...responderData,
      location: locationData
    })
  } catch (error) {
    console.error('Error fetching responder status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' }, 
      { status: 500 }
    )
  }
} 