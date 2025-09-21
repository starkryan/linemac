import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { hasPermission } from "@/lib/user-management";
import bcrypt from "bcrypt";

interface PasswordChangeRequest {
  userId: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const currentUser = session.user;
    const body = await request.json() as PasswordChangeRequest;
    const { userId, newPassword } = body;

    // Validate required fields
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "User ID and new password are required" },
        { status: 400 }
      );
    }

    // Validate password length (minimum 8 characters)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Get current user's role from database
    const currentUserData = await query(
      'SELECT role FROM "user" WHERE id = $1',
      [currentUser.id]
    );

    if (currentUserData.rows.length === 0) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    const currentUserRole = currentUserData.rows[0].role;

    // Check if target user exists
    const targetUser = await query(
      'SELECT id, email, role FROM "user" WHERE id = $1',
      [userId]
    );

    if (targetUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const targetUserData = targetUser.rows[0];

    // Check permissions
    // Users can change their own password
    // Admins can change any user's password
    // Supervisors can change operator passwords
    if (currentUser.id !== userId) {
      if (currentUserRole === 'admin') {
        // Admins can change any password
      } else if (currentUserRole === 'supervisor' && targetUserData.role === 'operator') {
        // Supervisors can change operator passwords
      } else {
        return NextResponse.json(
          { error: "Insufficient permissions to change this user's password" },
          { status: 403 }
        );
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password in the account table
    const updateResult = await query(
      `UPDATE "account"
       SET password = $1, "updatedAt" = NOW()
       WHERE "userId" = $2
       RETURNING id`,
      [hashedPassword, userId]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Log the password change (for audit purposes)
    await query(
      `INSERT INTO password_change_log (user_id, changed_by, changed_at, ip_address)
       VALUES ($1, $2, NOW(), $3)`,
      [userId, currentUser.id, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown']
    ).catch(() => {
      // Don't fail if logging fails, but we could add monitoring here
    });

    return NextResponse.json({
      message: "Password updated successfully",
      userId: userId,
      changedAt: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error("Password change error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to change password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during password change" },
      { status: 500 }
    );
  }
}