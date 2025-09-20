import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { createUser } from "@/lib/user-management";
import { requireAdmin } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
  email: string;
  name: string;
  password: string;
  username?: string;
  role?: 'admin' | 'supervisor' | 'operator';
  phone?: string;
  aadhaar_number?: string;
  operator_uid?: string;
  operator_name?: string;
  createdBy?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // This is an error response
    }

    const adminUser = authResult;
    const body = await request.json() as RegisterRequestBody;
    const { email, name, password, username, role, phone, aadhaar_number, operator_uid, operator_name } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Validate operator UID for operator role
    if (role === 'operator' && !operator_uid) {
      return NextResponse.json(
        { error: "Operator UID is required for operator role" },
        { status: 400 }
      );
    }

    // Validate operator name format
    if (operator_name && operator_name.length < 2) {
      return NextResponse.json(
        { error: "Operator name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" },
        { status: 400 }
      );
    }

    // Set default role to operator if not specified
    const userRole = role || 'operator';

    // Only admins can create admin accounts
    if (role === 'admin') {
      return NextResponse.json(
        { error: "Cannot create admin accounts through this endpoint" },
        { status: 403 }
      );
    }

    // Use Better Auth's signUp.email method
    const response = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
      },
      headers: request.headers,
    });

    // If there's an error from Better Auth, return it
    if ('error' in response && response.error) {
      return NextResponse.json(
        { error: typeof response.error === 'object' && 'message' in response.error ? response.error.message : "Registration failed" },
        { status: 400 }
      );
    }

    if (!response.user?.id) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Update the user with role and additional information
    try {
      // Update the existing user record created by Better Auth
      await query(
        `UPDATE "user"
         SET name = $1, role = $2, phone = $3, aadhaar_number = $4, operator_uid = $5, operator_name = $6, created_by = $7, status = 'active'
         WHERE id = $8`,
        [name, userRole, phone || null, aadhaar_number || null, operator_uid || null, operator_name || null, adminUser.id, response.user.id]
      );

    } catch (updateError) {
      console.error("Error updating user with role:", updateError);
      // If role update fails, delete the user to maintain consistency
      await query(`DELETE FROM "user" WHERE id = $1`, [response.user.id]);
      return NextResponse.json(
        { error: "Failed to complete user registration" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: "User created successfully by admin.",
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: userRole,
        phone,
        aadhaar_number,
        operator_uid,
        operator_name,
        createdBy: adminUser.id
      },
    });

  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "An unexpected error occurred during registration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}