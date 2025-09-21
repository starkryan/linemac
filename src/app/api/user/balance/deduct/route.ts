import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { amount } = await request.json()

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Check if user exists and get current balance
    const userResult = await query(
      'SELECT balance FROM "user" WHERE id = $1',
      [session.user.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentBalance = parseFloat(userResult.rows[0].balance) || 0
    const newBalance = currentBalance - amount

    // Validate that user has sufficient balance for deduction (if positive amount)
    if (amount > 0 && newBalance < 0) {
      return NextResponse.json({
        error: 'Insufficient balance',
        currentBalance,
        requiredAmount: amount
      }, { status: 400 })
    }

    // Update balance
    const updateResult = await query(
      'UPDATE "user" SET balance = $1 WHERE id = $2 RETURNING balance',
      [newBalance, session.user.id]
    )

    // Log transaction for audit purposes
    try {
      await query(
        `INSERT INTO wallet_transactions (user_id, amount, type, description, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          session.user.id,
          amount,
          amount > 0 ? 'credit' : 'debit',
          amount > 0 ? 'Balance refund' : 'Application fee deduction'
        ]
      )
    } catch (logError) {
      console.error('Failed to log transaction:', logError)
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({
      success: true,
      newBalance: parseFloat(updateResult.rows[0].balance),
      previousBalance: currentBalance,
      amount: amount
    })

  } catch (error) {
    console.error('Error deducting balance:', error)
    return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 })
  }
}