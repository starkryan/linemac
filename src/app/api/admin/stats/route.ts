import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { hasPermission, getUserStats } from "@/lib/user-management";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const currentUser = session.user;

    // Check if user has permission to view dashboard
    const canView = await hasPermission(currentUser.id, 'supervisor');
    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions to view dashboard" },
        { status: 403 }
      );
    }

    // Get user statistics
    const userStats = await getUserStats();

    // Get recent activity (last 7 days)
    const recentActivity = await query(`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as new_users
      FROM "user"
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    // Get correction request statistics
    const requestStats = await query(`
      SELECT
        status,
        COUNT(*) as count
      FROM correction_requests
      GROUP BY status
    `);

    // Get recent correction requests
    const recentRequests = await query(`
      SELECT
        cr.id,
        cr.aadhaar_number,
        cr.name,
        cr.status,
        cr.created_at,
        u.name as user_name
      FROM correction_requests cr
      JOIN "user" u ON cr.user_id = u.id
      ORDER BY cr.created_at DESC
      LIMIT 5
    `);

    // Calculate monthly growth
    const monthlyGrowth = await query(`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as users
      FROM "user"
      WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `);

    return NextResponse.json({
      userStats,
      recentActivity: recentActivity.rows,
      requestStats: requestStats.rows,
      recentRequests: recentRequests.rows,
      monthlyGrowth: monthlyGrowth.rows,
    });

  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch dashboard statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}