import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user balance
    let balance = 0
    try {
      const result = await query(
        'SELECT balance FROM "user" WHERE id = $1',
        [session.user.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      balance = parseFloat(result.rows[0].balance) || 0
    } catch (error) {
      // If balance column doesn't exist, create it and return 0
      console.log('Balance column might not exist, attempting to add it:', error)

      try {
        await query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0`)
        // Balance will be 0 (default value)
      } catch (alterError) {
        console.error('Failed to add balance column:', alterError)
        // Still return 0 as default balance
      }
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}