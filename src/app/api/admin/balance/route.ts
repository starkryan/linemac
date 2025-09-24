import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { query } from '@/lib/db';
import { z } from 'zod';

const balanceAdjustmentSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['credit', 'debit']),
  description: z.string().min(1, 'Description is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database since it's not in the session
    const adminRoleResult = await query(
      'SELECT role FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (adminRoleResult.rows.length === 0 || adminRoleResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = balanceAdjustmentSchema.parse(body);

    const { userId, amount, type, description } = validatedData;

    await query('BEGIN');

    try {
      const userResult = await query(
        'SELECT balance, role FROM "user" WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (userResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = userResult.rows[0];

      if (type === 'debit' && user.balance < amount) {
        await query('ROLLBACK');
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      const newBalance = type === 'credit'
        ? Number(user.balance) + amount
        : Number(user.balance) - amount;

      await query(
        'UPDATE "user" SET balance = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, userId]
      );

      await query(
        `INSERT INTO transactions (
          user_id, amount, type, status, description,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'completed', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, amount, type, `Admin ${type}: ${description}`]
      );

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Balance ${type}ed successfully`,
        newBalance,
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Balance adjustment error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database since it's not in the session
    const adminRoleResult = await query(
      'SELECT role FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (adminRoleResult.rows.length === 0 || adminRoleResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUserResult = await query(
      'SELECT id, name, email, balance, role FROM "user" WHERE id = $1',
      [userId]
    );

    if (targetUserResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = targetUserResult.rows[0];

    const transactionsResult = await query(
      `SELECT
        id, amount, type, status, description, created_at
        FROM transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [userId]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: Number(user.balance),
        role: user.role,
      },
      transactions: transactionsResult.rows.map(tx => ({
        id: tx.id,
        amount: Number(tx.amount),
        type: tx.type,
        status: tx.status,
        description: tx.description,
        createdAt: tx.created_at,
      })),
    });

  } catch (error) {
    console.error('Get balance history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}