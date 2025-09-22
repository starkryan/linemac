import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { hasPermission } from "@/lib/user-management";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const params = await context.params;
    const userId = params.id;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admins can delete users
    const canDelete = await hasPermission(session.user.id, 'admin');
    if (!canDelete) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Validate user ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await query(
      'SELECT id, email, name FROM "user" WHERE id = $1',
      [userId]
    );

    if (!userExists || userExists.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userToDelete = userExists.rows[0];

    // Delete user and all related data (in reverse order of dependencies)
    try {
      // Delete user's transactions
      await query(
        'DELETE FROM transactions WHERE user_id = $1',
        [userId]
      );

      // Delete user's correction requests
      await query(
        'DELETE FROM correction_requests WHERE user_id = $1',
        [userId]
      );

      // Delete user's verification tokens
      await query(
        'DELETE FROM verification WHERE identifier = $1',
        [userToDelete.email]
      );

      // Delete user's accounts (OAuth, etc.)
      await query(
        'DELETE FROM account WHERE "userId" = $1',
        [userId]
      );

      // Delete user's sessions
      await query(
        'DELETE FROM session WHERE "userId" = $1',
        [userId]
      );

      // Finally, delete the user
      await query(
        'DELETE FROM "user" WHERE id = $1',
        [userId]
      );
    } catch (deleteError) {
      console.error('Error during user deletion:', deleteError);
      throw new Error('Failed to delete user data');
    }

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name
      }
    });

  } catch (error) {
    console.error("Error deleting user:", error);

    // Check for foreign key constraint violations
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: "Cannot delete user: user has related data that cannot be removed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}