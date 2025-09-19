import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user,
      session: session.session
    });

  } catch (error: unknown) {
    console.error("Error getting session:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to get session" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}