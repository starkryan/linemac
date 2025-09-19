import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth'

const KUKUPAY_API_URL = 'https://kukupay.pro/pay/create'
const KUKUPAY_API_KEY = '1tqgOifuydEFIc5Ss8JzWuLfawB227om'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount } = await request.json()

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 10) {
      return NextResponse.json({
        error: 'Invalid amount. Minimum recharge amount is ₹10'
      }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `UCL-${session.user.id}-${Date.now()}`

    // Create transaction record
    const transactionResult = await query(
      `INSERT INTO transactions (user_id, amount, type, status, description, order_id)
       VALUES ($1, $2, 'credit', 'pending', 'Wallet recharge', $3)
       RETURNING id`,
      [session.user.id, amount, orderId]
    )

    const transactionId = transactionResult.rows[0].id

    // Prepare payment data for kukupay.pro
    const paymentData = {
      api_key: KUKUPAY_API_KEY,
      amount: amount,
      phone: '0000000000', // Default phone number - you might want to collect this from user
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wallet/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/wallet?success=true`,
      order_id: orderId
    }

    // Make request to kukupay.pro
    const response = await fetch(KUKUPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    const paymentResponse = await response.json()

    if (!response.ok || paymentResponse.status !== 200) {
      // Update transaction status to failed
      await query(
        `UPDATE transactions SET status = 'failed' WHERE id = $1`,
        [transactionId]
      )

      return NextResponse.json({
        error: 'Failed to initiate payment',
        details: paymentResponse
      }, { status: 500 })
    }

    // Extract payment URL from the response data
    const paymentUrl = paymentResponse.data?.payment_url

    // Update transaction with payment URL
    await query(
      `UPDATE transactions SET payment_url = $1 WHERE id = $2`,
      [paymentUrl, transactionId]
    )

    if (!paymentUrl) {
      return NextResponse.json({
        error: 'Payment URL not found in response',
        full_response: paymentResponse
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      transaction_id: transactionId,
      order_id: orderId
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({
      error: 'Failed to initiate payment'
    }, { status: 500 })
  }
}