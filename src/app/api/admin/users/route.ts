import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { createUser } from "@/lib/user-management";
import { hasPermission } from "@/lib/user-management";

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'supervisor' | 'operator';
  phone?: string;
  aadhaar_number?: string;
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
    const body = await request.json() as CreateUserRequest;
    const { email, name, password, role, phone, aadhaar_number } = body;

    // Validate required fields
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: "Email, name, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'supervisor', 'operator'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, supervisor, or operator" },
        { status: 400 }
      );
    }

    // Check permissions based on role being created
    if (role === 'admin') {
      // Only admins can create other admins
      const canCreate = await hasPermission(currentUser.id, 'admin');
      if (!canCreate) {
        return NextResponse.json(
          { error: "Only administrators can create admin accounts" },
          { status: 403 }
        );
      }
    } else if (role === 'supervisor') {
      // Only admins can create supervisors
      const canCreate = await hasPermission(currentUser.id, 'admin');
      if (!canCreate) {
        return NextResponse.json(
          { error: "Only administrators can create supervisor accounts" },
          { status: 403 }
        );
      }
    } else if (role === 'operator') {
      // Both admins and supervisors can create operators
      const canCreate = await hasPermission(currentUser.id, 'supervisor');
      if (!canCreate) {
        return NextResponse.json(
          { error: "Only administrators and supervisors can create operator accounts" },
          { status: 403 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user with Better Auth first
    const authResponse = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
      },
      headers: request.headers,
    });

    if ('error' in authResponse && authResponse.error) {
      return NextResponse.json(
        { error: typeof authResponse.error === 'object' && 'message' in authResponse.error ? authResponse.error.message : "Failed to create user account" },
        { status: 400 }
      );
    }

    if (!authResponse.user?.id) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Update the user with role and additional information
    try {
      await createUser({
        name,
        email,
        password,
        role,
        phone,
        aadhaar_number,
        createdBy: currentUser.id
      });

      // Update the user record with role and set status to active
      await query(
        `UPDATE "user"
         SET role = $1, phone = $2, aadhaar_number = $3, created_by = $4, status = 'active'
         WHERE id = $5`,
        [role, phone || null, aadhaar_number || null, currentUser.id, authResponse.user.id]
      );

    } catch (updateError) {
      console.error("Error updating user with role:", updateError);
      // If role update fails, delete the user to maintain consistency
      await query(`DELETE FROM "user" WHERE id = $1`, [authResponse.user.id]);
      return NextResponse.json(
        { error: "Failed to complete user creation" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        name: authResponse.user.name,
        role,
        phone,
        aadhaar_number,
        status: 'active'
      },
    });

  } catch (error: unknown) {
    console.error("User creation error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "An unexpected error occurred during user creation" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during user creation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Check if user has permission to view users
    const canView = await hasPermission(currentUser.id, 'supervisor');
    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions to view users" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Import the getUsers function from user-management
    const { getUsers } = await import('@/lib/user-management');

    const result = await getUsers(page, limit, {
      role: role || undefined,
      status: status || undefined,
      search: search || undefined
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Error fetching users:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}