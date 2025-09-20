import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // For now, return a simple session structure that matches useAuthGuard expectations
    // This can be enhanced later when Better Auth session is fully working
    const cookies = request.headers.get('cookie') || '';

    // Simple cookie check for session existence
    const hasSession = cookies.includes('session') || cookies.includes('better-auth');

    if (!hasSession) {
      return NextResponse.json({
        user: null,
        session: null
      }, { status: 401 });
    }

    // Return mock session data for now - replace with real session data when available
    const mockSessionData = {
      user: {
        id: "demo-user-id",
        name: "Demo Operator",
        email: "operator@ucl.com",
        emailVerified: true,
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "operator",
        operatorUid: "820-0515-57084",
        operatorName: "Demo Operator",
        machineId: "MP_0515_ML_NSS42224",
        location: "22°28'1.391579 N,80°6'49.42383\" E"
      },
      session: {
        id: "demo-session-id",
        userId: "demo-user-id",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: "demo-token",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ipAddress: "127.0.0.1",
        userAgent: request.headers.get('user-agent') || "Unknown"
      }
    };

    return NextResponse.json(mockSessionData);
  } catch (error) {
    console.error("Session endpoint error:", error);
    return NextResponse.json({ user: null, session: null }, { status: 500 });
  }
}