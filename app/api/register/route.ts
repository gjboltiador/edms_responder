import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import mysql from 'mysql2/promise'

// Database configuration (same as in lib/db.ts)
const dbConfig = {
  host: 'sql12.freesqldatabase.com',
  user: 'sql12785202',
  password: 'IGkaKLGJxR',
  database: 'sql12785202',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { username, password, name, contact_number } = await request.json()

    // Validate required fields
    if (!username || !password || !name || !contact_number) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' }, 
        { status: 409 }
      )
    }

    // Check if responder with this username already exists
    const existingResponder = await query(
      'SELECT id FROM responders WHERE username = ?',
      [username]
    )

    if (existingResponder.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists as a responder' }, 
        { status: 409 }
      )
    }

    // Use direct connection for INSERT operations to get insertId
    connection = await mysql.createConnection(dbConfig)

    // Create user first
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    )

    const userId = (userResult as any).insertId

    if (!userId) {
      throw new Error('Failed to create user')
    }

    // Create responder linked to the user
    await connection.execute(
      'INSERT INTO responders (user_id, username, name, contact_number, status) VALUES (?, ?, ?, ?, ?)',
      [userId, username, name, contact_number, 'Available']
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      data: {
        userId,
        username,
        name,
        contact_number
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' }, 
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
} 