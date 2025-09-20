"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Loader2
} from "lucide-react";

interface DashboardStatsProps {
  className?: string;
}

export default function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [statusOverview, setStatusOverview] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      // Set stats
      setStats([
        {
          title: "Total Users",
          value: data.userStats?.total?.toLocaleString() || "0",
          change: calculateGrowth(data.monthlyGrowth),
          changeType: "positive",
          icon: Users,
          description: "Registered users",
          color: "text-orange-600"
        },
        {
          title: "Active Users",
          value: data.userStats?.active?.toLocaleString() || "0",
          change: "+8%",
          changeType: "positive",
          icon: Users,
          description: "Currently active users",
          color: "text-green-600"
        },
        {
          title: "Pending Users",
          value: data.userStats?.pending?.toLocaleString() || "0",
          change: "-2%",
          changeType: "negative",
          icon: Clock,
          description: "Awaiting approval",
          color: "text-orange-600"
        },
        {
          title: "Total Balance",
          value: `₹${calculateTotalBalance(data.userStats).toLocaleString()}`,
          change: "+15%",
          changeType: "positive",
          icon: DollarSign,
          description: "Total user balance",
          color: "text-purple-600"
        }
      ]);

      // Set status overview from request stats
      if (data.requestStats && data.requestStats.length > 0) {
        const totalRequests = data.requestStats.reduce((sum: number, stat: any) => sum + parseInt(stat.count), 0);
        const statusData = data.requestStats.map((stat: any) => ({
          status: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
          count: parseInt(stat.count),
          percentage: Math.round((parseInt(stat.count) / totalRequests) * 100),
          icon: getStatusIcon(stat.status),
          color: getStatusColor(stat.status),
          bgColor: getStatusBgColor(stat.status)
        }));
        setStatusOverview(statusData);
      }

      // Set recent activity from recent requests
      if (data.recentRequests && data.recentRequests.length > 0) {
        const activity = data.recentRequests.map((request: any) => ({
          user: request.user_name,
          action: `${request.request_type} request ${request.status.toLowerCase()}`,
          time: formatTimeAgo(new Date(request.submitted_date)),
          type: request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'info'
        }));
        setRecentActivity(activity);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (monthlyGrowth: any[]) => {
    if (!monthlyGrowth || monthlyGrowth.length < 2) return "+0%";

    const current = parseInt(monthlyGrowth[monthlyGrowth.length - 1].users);
    const previous = parseInt(monthlyGrowth[monthlyGrowth.length - 2].users);

    if (previous === 0) return "+100%";

    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${Math.round(growth)}%`;
  };

  const calculateTotalBalance = (userStats: any) => {
    // This is a placeholder - in a real app, you'd calculate actual total balance
    return Math.floor(Math.random() * 1000000) + 500000;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100';
      case 'pending': return 'bg-orange-100';
      case 'rejected': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <img
                    src="/loader.gif"
                    alt="Loading..."
                    width={24}
                    height={24}
                    className="animate-pulse"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={stat.changeType === "positive" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusOverview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Request Status Overview</span>
              </CardTitle>
              <CardDescription>
                Distribution of correction request statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusOverview.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <status.icon className={`h-4 w-4 ${status.color}`} />
                      <span className="text-sm font-medium">{status.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{status.count}</span>
                      <Badge className={`${status.bgColor} ${status.color} text-xs`}>
                        {status.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={status.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest system activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.type === "success" ? "bg-green-500" :
                    activity.type === "error" ? "bg-red-500" :
                    "bg-blue-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}