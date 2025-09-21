import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Debug endpoint: Starting authentication debug...");

    // Check Better Auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      headers: {
        cookie: request.headers.get('cookie'),
        authorization: request.headers.get('authorization'),
      },
      session: session ? {
        exists: true,
        userId: session.user?.id,
        email: session.user?.email,
        sessionExpires: session.session?.expiresAt,
      } : {
        exists: false,
        reason: 'No session found'
      }
    };

    // If session exists, check database
    if (session?.user?.id) {
      const userResult = await query(
        'SELECT role, aadhaar_number, name, email, status FROM "user" WHERE id = $1',
        [session.user.id]
      );

      if (userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        debugInfo.databaseUser = {
          exists: true,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          status: userData.status,
          aadhaar_number: userData.aadhaar_number
        };
      } else {
        debugInfo.databaseUser = {
          exists: false,
          reason: 'User not found in database'
        };
      }
    }

    console.log("Debug endpoint: Debug info generated");
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}