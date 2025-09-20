import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { auth } from "@/lib/auth-server";
import { hasPermission } from "@/lib/user-management";

export async function middleware(request: NextRequest) {
  // Check for session cookie for optimistic redirect
  const session = await getCookieCache(request);
  const { pathname } = request.nextUrl;

  // If authenticated user tries to access login page, redirect to dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/aadhaar-correction", request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    try {
      // Get the user session to check permissions
      const authSession = await auth.api.getSession({
        headers: request.headers,
      });

      if (!authSession?.user?.id) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check if user has admin permissions
      const hasAdminAccess = await hasPermission(authSession.user.id, 'admin');

      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error('Admin access check error:', error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Apply Better Auth middleware
  const authResponse = await auth.handler(request);

  if (authResponse) {
    return authResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};