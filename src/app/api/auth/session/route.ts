import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Session endpoint: Starting session check...");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log("Session endpoint: Session result:", session ? "Found" : "Not found");

    if (!session?.user?.id) {
      console.log("Session endpoint: No valid session found");
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Get user data from database to include custom fields
    const userResult = await query(
      'SELECT role, aadhaar_number, name, email FROM "user" WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      console.log("Session endpoint: User not found in database for ID:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userResult.rows[0];
    console.log("Session endpoint: User data found, role:", userData.role);

    // Return custom session data with user fields
    const sessionData = {
      user: {
        id: session.user.id,
        name: session.user.name || userData.name,
        email: session.user.email || userData.email,
        emailVerified: session.user.emailVerified || false,
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
    };

    console.log("Session endpoint: Returning session data for user:", sessionData.user.email);
    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Custom session endpoint error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}