import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

interface LoginRequestBody {
  operatorUid: string;
  operatorName: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequestBody;
    const { operatorUid, operatorName, password } = body;

    // Validate required fields
    if (!operatorUid || !operatorName || !password) {
      return NextResponse.json(
        { error: "Operator UID, Operator Name, and Password are required" },
        { status: 400 }
      );
    }

    // Custom validation: Check if user exists with matching UID and name (both admin and operator roles)
    const operatorResult = await query(
      'SELECT * FROM "user" WHERE aadhaar_number = $1 AND name = $2 AND role IN ($3, $4)',
      [operatorUid, operatorName, 'operator', 'admin']
    );

    if (operatorResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid Operator UID or Operator Name" },
        { status: 401 }
      );
    }

    const operator = operatorResult.rows[0];

    // Use the operator's email for Better Auth authentication
    const email = operator.email;

    // Get the password hash from the account table
    const accountResult = await query(
      'SELECT password FROM account WHERE "userId" = $1',
      [operator.id]
    );

    if (accountResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 401 }
      );
    }

    const passwordHash = accountResult.rows[0].password;

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid Operator UID or Operator Name or Password" },
        { status: 401 }
      );
    }

    // Now create the actual Better Auth session
    try {
      const sessionResponse = await auth.api.signInEmail({
        body: {
          email: operator.email,
          password: password,
        },
        headers: request.headers,
      });

      if ('error' in sessionResponse) {
        console.error("Better Auth session creation error:", sessionResponse.error);
        return NextResponse.json(
          { error: "Failed to create session: " + (sessionResponse.error.message || "Unknown error") },
          { status: 500 }
        );
      }

      console.log("Better Auth session created successfully for user:", operator.id);

      // Return success response - session cookie is automatically set by Better Auth
      return NextResponse.json({
        message: "Login successful",
        user: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          role: operator.role,
          operatorUid: operatorUid,
          operatorName: operatorName,
        },
      });

    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("Login error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "An unexpected error occurred during login" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}