import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { hasPermission } from "@/lib/user-management";
import bcrypt from "bcrypt";

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'supervisor' | 'operator';
  phone?: string;
  aadhaar_number?: string;
  operator_uid?: string;
  operator_name?: string;
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
    const { email, name, password, role, phone, aadhaar_number, operator_uid, operator_name } = body;

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

    // Validate operator fields for operator role
    if (role === 'operator') {
      if (!operator_uid) {
        return NextResponse.json(
          { error: "Operator UID is required for operator role" },
          { status: 400 }
        );
      }
      if (!operator_name || operator_name.length < 2) {
        return NextResponse.json(
          { error: "Operator name is required and must be at least 2 characters long" },
          { status: 400 }
        );
      }
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

    // Create user directly in database to avoid session corruption
    let userId: string;
    let accountId: string;
    try {
      // Generate UUIDs for the new user and account
      const uuidResult = await query('SELECT gen_random_uuid() as user_id, gen_random_uuid() as account_id');
      userId = uuidResult.rows[0].user_id;
      const accountId = uuidResult.rows[0].account_id;

      // Hash the password using the same method as Better Auth
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert the user record first
      const userResult = await query(
        `INSERT INTO "user" (id, email, name, "emailVerified", role, aadhaar_number, operator_uid, operator_name, created_by, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING id, email, name, role, "emailVerified", "createdAt"`,
        [
          userId,
          email,
          name,
          false, // emailVerified
          role,
          aadhaar_number || null,
          operator_uid || null,
          operator_name || null,
          currentUser.id // created_by
        ]
      );

      if (userResult.rows.length === 0) {
        throw new Error("Failed to create user record");
      }

      // Insert the account record with password
      const accountResult = await query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id`,
        [
          accountId, // id
          accountId, // accountId - same as id for Better Auth
          'credential', // providerId for email/password
          userId, // userId - references the user
          hashedPassword
        ]
      );

      if (accountResult.rows.length === 0) {
        // If account creation fails, delete the user to maintain consistency
        await query(`DELETE FROM "user" WHERE id = $1`, [userId]);
        throw new Error("Failed to create account record");
      }

    } catch (createError) {
      console.error("Error creating user:", createError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: userId,
        email,
        name,
        role,
        phone,
        aadhaar_number,
        operator_uid,
        operator_name,
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