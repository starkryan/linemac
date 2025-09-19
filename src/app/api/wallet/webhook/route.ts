import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()

    console.log('Webhook received:', webhookData)

    // Verify webhook signature (implementation depends on kukupay.pro)
    // For now, we'll proceed with basic validation

    const { order_id, status, amount, payment_id } = webhookData

    if (!order_id) {
      return NextResponse.json({
        error: 'Missing order_id in webhook data'
      }, { status: 400 })
    }

    // Find transaction by order_id
    const transactionResult = await query(
      'SELECT * FROM transactions WHERE order_id = $1',
      [order_id]
    )

    if (transactionResult.rows.length === 0) {
      return NextResponse.json({
        error: 'Transaction not found'
      }, { status: 404 })
    }

    const transaction = transactionResult.rows[0]

    // Update transaction based on payment status
    let newStatus = transaction.status
    let balanceUpdate = 0

    if (status === 'success' || status === 'completed') {
      newStatus = 'completed'
      balanceUpdate = parseFloat(transaction.amount)
    } else if (status === 'failed' || status === 'cancelled') {
      newStatus = 'failed'
    }

    // Update transaction record
    await query(
      `UPDATE transactions
       SET status = $1, payment_id = $2, webhook_received = true, updated_at = NOW()
       WHERE id = $3`,
      [newStatus, payment_id, transaction.id]
    )

    // If payment successful, update user balance
    if (newStatus === 'completed' && balanceUpdate > 0) {
      // Check if balance column exists, if not create it
      try {
        await query(
          `UPDATE "user"
           SET balance = COALESCE(balance, 0) + $1
           WHERE id = $2`,
          [balanceUpdate, transaction.user_id]
        )
      } catch (error) {
        // If balance column doesn't exist, create it using ALTER TABLE
        console.error('Balance column might not exist, attempting to add it:', error)

        try {
          await query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0`)

          // Retry balance update
          await query(
            `UPDATE "user"
             SET balance = COALESCE(balance, 0) + $1
             WHERE id = $2`,
            [balanceUpdate, transaction.user_id]
          )
        } catch (alterError) {
          console.error('Failed to add balance column:', alterError)
        }
      }
    }

    console.log(`Transaction ${order_id} updated to status: ${newStatus}`)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({
      error: 'Failed to process webhook'
    }, { status: 500 })
  }
}

// Handle webhook verification (if kukupay.pro requires it)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'webhook endpoint active'
  })
}