import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Get user data from database to include custom fields
    const userResult = await query(
      'SELECT role, aadhaar_number, name FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userResult.rows[0];

    // Get original session data
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      headers: request.headers,
    });

    const originalSession = await response.json();

    // Add our custom fields to the session
    originalSession.user.role = userData.role || 'operator';
    originalSession.user.operatorUid = userData.aadhaar_number;
    originalSession.user.operatorName = userData.name;

    return NextResponse.json(originalSession);
  } catch (error) {
    console.error("Custom session endpoint error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}