import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Use Better Auth's getSession method with proper headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(null, { status: 401 });
    }

    // Get the user's role from the database
    const userResult = await query(
      'SELECT role FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(null, { status: 401 });
    }

    // Return the session with user information including role
    return NextResponse.json({
      user: {
        ...session.user,
        role: userResult.rows[0].role,
      },
      session: session.session,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(null, { status: 401 });
  }
}