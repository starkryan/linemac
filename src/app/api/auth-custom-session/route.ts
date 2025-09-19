import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
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

    // Return custom session data with user fields
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
        role: userData.role || 'operator',
        operatorUid: userData.aadhaar_number,
        operatorName: userData.name
      },
      session: {
        expiresAt: session.session.expiresAt,
        token: session.session.token,
        createdAt: session.session.createdAt,
        updatedAt: session.session.updatedAt,
        ipAddress: session.session.ipAddress,
        userAgent: session.session.userAgent,
        userId: session.session.userId,
        id: session.session.id
      }
    });
  } catch (error) {
    console.error("Custom session endpoint error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}