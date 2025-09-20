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

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch user transactions
    const transactionsResult = await query(
      `SELECT id, amount, type, status, description, order_id,
              created_at, updated_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [session.user.id, limit, offset]
    )

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = $1',
      [session.user.id]
    )

    const transactions = transactionsResult.rows.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }))

    return NextResponse.json({
      transactions,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}