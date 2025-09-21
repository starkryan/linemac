import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

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
    if (!amount || typeof amount !== 'number' || amount < 500) {
      return NextResponse.json({
        error: 'Invalid amount. Minimum recharge amount is ₹500',
        warning: 'Amounts below ₹500 are not supported by the payment gateway'
      }, { status: 400 })
    }

    // Generate unique order ID using UUID to prevent collision in concurrent requests
    const orderId = `UCL-${randomUUID()}`

    // Create transaction record
    const transactionResult = await query(
      `INSERT INTO transactions (user_id, amount, type, status, description, order_id)
       VALUES ($1, $2, 'credit', 'pending', 'Wallet recharge', $3)
       RETURNING id`,
      [session.user.id, amount, orderId]
    )

    const transactionId = transactionResult.rows[0].id

    // Prepare payment data for kukupay.pro
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // For webhook, we need a publicly accessible URL
    // Using ngrok or similar service for local development
    const webhookUrl = process.env.WEBHOOK_URL || `${baseUrl}/api/wallet/webhook`

    const paymentData = {
      api_key: KUKUPAY_API_KEY,
      amount: amount,
      phone: '9999999999', // Use a valid test phone number format
      webhook_url: webhookUrl,
      return_url: `${baseUrl}/wallet?success=true`,
      order_id: orderId
    }

    // Make request to kukupay.pro
    console.log('Sending payment request to kukupay.pro:', JSON.stringify(paymentData, null, 2))

    let response
    try {
      response = await fetch(KUKUPAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })
      console.log('Kukupay response status:', response.status)
    } catch (fetchError) {
      console.error('Network error calling kukupay.pro:', fetchError)
      return NextResponse.json({
        error: 'Network error connecting to payment provider',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 })
    }

    let paymentResponse
    try {
      paymentResponse = await response.json()
      console.log('Kukupay response body:', JSON.stringify(paymentResponse, null, 2))
    } catch (jsonError) {
      console.error('Error parsing kukupay response:', jsonError)
      return NextResponse.json({
        error: 'Invalid response from payment provider',
        details: jsonError instanceof Error ? jsonError.message : 'Unknown error'
      }, { status: 500 })
    }

    if (!response.ok || (paymentResponse.status && paymentResponse.status !== 200)) {
      console.error('Payment failed:', { responseStatus: response.status, paymentResponse })
      // Update transaction status to failed
      await query(
        `UPDATE transactions SET status = 'failed' WHERE id = $1`,
        [transactionId]
      )

      return NextResponse.json({
        error: 'Failed to initiate payment',
        details: {
          responseStatus: response.status,
          paymentResponse
        }
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