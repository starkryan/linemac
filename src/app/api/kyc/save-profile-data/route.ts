import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

interface ProfileData {
  fullName?: string
  phone?: string
  gender?: string
  dateOfBirth?: string
  house?: string
  street?: string
  village?: string
  city?: string
  pinCode?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body: ProfileData = await request.json()

    // Validate input data
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    // Build dynamic update query based on provided fields
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Map camelCase to snake_case for database columns
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (dbField === 'date_of_birth') {
          updateFields.push(`${dbField} = $${paramIndex}`)
          updateValues.push(new Date(value))
        } else {
          updateFields.push(`${dbField} = $${paramIndex}`)
          updateValues.push(value)
        }
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid profile data provided' },
        { status: 400 }
      )
    }

    // Add user ID to parameter values
    updateValues.push(userId)

    // Build and execute the update query
    const updateQuery = `
      UPDATE "user"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING
        id, email, name, full_name, phone, gender, date_of_birth,
        address, house, street, village, city, pin_code,
        kyc_status, kyc_photo_url, operator_uid, operator_name, role
    `

    const result = await query(updateQuery, updateValues)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = result.rows[0]

    // Format the response
    const responseUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      fullName: updatedUser.full_name,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.date_of_birth ? new Date(updatedUser.date_of_birth).toISOString().split('T')[0] : '',
      address: updatedUser.address,
      house: updatedUser.house,
      street: updatedUser.street,
      village: updatedUser.village,
      city: updatedUser.city,
      pinCode: updatedUser.pin_code,
      kycStatus: updatedUser.kyc_status,
      kycPhotoUrl: updatedUser.kyc_photo_url,
      operatorUid: updatedUser.operator_uid,
      operatorName: updatedUser.operator_name,
      role: updatedUser.role
    }

    return NextResponse.json({
      success: true,
      user: responseUser,
      message: 'Profile data saved successfully'
    })

  } catch (error) {
    console.error('Profile data save error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save profile data' },
      { status: 500 }
    )
  }
}