import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      )
    }

    // Get responder profile details
    const sql = `
      SELECT r.id, r.username, r.name, r.contact_number, r.status, r.last_active,
             u.firstname, u.lastname
      FROM responders r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.username = ?
    `
    
    const results = await query<any>(sql, [username])
    
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Responder not found' }, 
        { status: 404 }
      )
    }

    const responder = results[0]
    
    return NextResponse.json({
      id: responder.id,
      username: responder.username,
      name: responder.name,
      contact_number: responder.contact_number,
      status: responder.status,
      last_active: responder.last_active,
      firstname: responder.firstname,
      lastname: responder.lastname
    })
  } catch (error) {
    console.error('Error fetching responder profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { username, name, contact_number, firstname, lastname, oldPassword, newPassword } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      )
    }

    // If password change is requested, validate old password
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: 'Old password is required to change password' }, 
          { status: 400 }
        )
      }

      // Verify old password
      const verifyPasswordSql = `
        SELECT u.password 
        FROM users u
        JOIN responders r ON u.id = r.user_id
        WHERE r.username = ?
      `
      
      const passwordResults = await query<any>(verifyPasswordSql, [username])
      
      if (passwordResults.length === 0) {
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        )
      }

      if (passwordResults[0].password !== oldPassword) {
        return NextResponse.json(
          { error: 'Old password is incorrect' }, 
          { status: 400 }
        )
      }

      // Update password in users table
      const updatePasswordSql = `
        UPDATE users u
        JOIN responders r ON u.id = r.user_id
        SET u.password = ?
        WHERE r.username = ?
      `
      
      await query(updatePasswordSql, [newPassword, username])
    }

    // Update responder profile
    const updateResponderSql = `
      UPDATE responders 
      SET name = ?, contact_number = ?
      WHERE username = ?
    `
    
    await query(updateResponderSql, [name, contact_number, username])

    // Update user profile if firstname/lastname provided
    if (firstname || lastname) {
      const updateUserSql = `
        UPDATE users u
        JOIN responders r ON u.id = r.user_id
        SET u.firstname = ?, u.lastname = ?
        WHERE r.username = ?
      `
      
      await query(updateUserSql, [firstname || '', lastname || '', username])
    }

    // Get updated profile
    const getProfileSql = `
      SELECT r.id, r.username, r.name, r.contact_number, r.status, r.last_active,
             u.firstname, u.lastname
      FROM responders r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.username = ?
    `
    
    const results = await query<any>(getProfileSql, [username])
    
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Responder not found' }, 
        { status: 404 }
      )
    }

    const updatedProfile = results[0]
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedProfile.id,
        username: updatedProfile.username,
        name: updatedProfile.name,
        contact_number: updatedProfile.contact_number,
        status: updatedProfile.status,
        last_active: updatedProfile.last_active,
        firstname: updatedProfile.firstname,
        lastname: updatedProfile.lastname
      }
    })
  } catch (error) {
    console.error('Error updating responder profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' }, 
      { status: 500 }
    )
  }
} 