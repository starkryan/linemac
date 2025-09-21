import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user balance with additional details
    const result = await query(
      'SELECT balance, currency FROM "user" WHERE id = $1',
      [session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = result.rows[0]

    return NextResponse.json({
      balance: parseFloat(userData.balance) || 0,
      currency: userData.currency || 'INR',
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching user balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}