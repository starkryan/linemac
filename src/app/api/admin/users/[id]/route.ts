import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { updateUser, deleteUser, hasPermission } from "@/lib/user-management";

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'supervisor' | 'operator';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  phone?: string;
  aadhaar_number?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    const targetUserId = params.id;

    // Check if user has permission to view users
    const canView = await hasPermission(currentUser.id, 'supervisor');
    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions to view user details" },
        { status: 403 }
      );
    }

    // Get user by ID
    const { getUserById } = await import('@/lib/user-management');
    const user = await getUserById(targetUserId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error: unknown) {
    console.error("Error fetching user:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    const targetUserId = params.id;
    const body = await request.json() as UpdateUserRequest;

    // Check if user exists
    const { getUserById } = await import('@/lib/user-management');
    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check permissions for different operations
    if (body.role) {
      // Role changes require admin permissions
      const canChangeRole = await hasPermission(currentUser.id, 'admin');
      if (!canChangeRole) {
        return NextResponse.json(
          { error: "Only administrators can change user roles" },
          { status: 403 }
        );
      }

      // Don't allow users to change their own role
      if (currentUser.id === targetUserId) {
        return NextResponse.json(
          { error: "Cannot change your own role" },
          { status: 400 }
        );
      }
    }

    if (body.status) {
      // Status changes require supervisor permissions
      const canChangeStatus = await hasPermission(currentUser.id, 'supervisor');
      if (!canChangeStatus) {
        return NextResponse.json(
          { error: "Only supervisors and administrators can change user status" },
          { status: 403 }
        );
      }

      // Don't allow users to deactivate themselves
      if (currentUser.id === targetUserId && body.status === 'inactive') {
        return NextResponse.json(
          { error: "Cannot deactivate your own account" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await updateUser(targetUserId, body);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error: unknown) {
    console.error("Error updating user:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    const targetUserId = params.id;

    // Cannot delete your own account
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Only admins can delete users
    const canDelete = await hasPermission(currentUser.id, 'admin');
    if (!canDelete) {
      return NextResponse.json(
        { error: "Only administrators can delete users" },
        { status: 403 }
      );
    }

    // Delete user
    const deleted = await deleteUser(targetUserId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });

  } catch (error: unknown) {
    console.error("Error deleting user:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}