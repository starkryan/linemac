import { auth } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Clear the session using Better Auth
    await auth.api.signOut({
      headers: request.headers,
    });

    // Clear session cookie
    const response = NextResponse.json({
      message: "Logout successful",
      success: true
    });

    // Clear the session cookie
    response.cookies.set('better-auth.session_token', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}