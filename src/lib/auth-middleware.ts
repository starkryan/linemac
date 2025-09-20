import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(request: NextRequest) {
  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const userResult = await query(
      'SELECT role, name, email, id FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Return the user object with role for use in the route
    return {
      id: user.id,
      email: session.user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function requireAuth(request: NextRequest) {
  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from database to include role
    const userResult = await query(
      'SELECT role, name, email, id FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Return the user object with role for use in the route
    return {
      id: user.id,
      email: session.user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}