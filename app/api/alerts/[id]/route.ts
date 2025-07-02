import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rows } = await sql`
      SELECT * FROM alerts 
      WHERE id = ${params.id}
    `
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 