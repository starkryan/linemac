"use client"

import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Activity
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ModernDashboardStats() {
  const stats = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "Active registered users",
      color: "text-blue-600"
    },
    {
      title: "Pending Requests",
      value: "1,234",
      change: "-8.2%",
      trend: "down",
      icon: FileText,
      description: "Awaiting processing",
      color: "text-orange-600"
    },
    {
      title: "Processed Today",
      value: "456",
      change: "+23.1%",
      trend: "up",
      icon: CheckCircle,
      description: "Successfully completed",
      color: "text-green-600"
    },
    {
      title: "System Load",
      value: "68%",
      change: "+2.4%",
      trend: "up",
      icon: Activity,
      description: "Current server load",
      color: "text-purple-600"
    }
  ]

  const activityData = [
    { name: "User Registrations", value: 234, target: 300, progress: 78 },
    { name: "Request Processing", value: 189, target: 250, progress: 76 },
    { name: "System Uptime", value: 99.2, target: 100, progress: 99 },
    { name: "Database Health", value: 94, target: 100, progress: 94 }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant={stat.trend === "up" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  from last month
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Daily Activity</span>
            </CardTitle>
            <CardDescription>
              Current performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityData.map((activity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{activity.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {activity.value}{activity.name === "System Uptime" || activity.name === "Database Health" ? "%" : ""}
                  </span>
                </div>
                <Progress
                  value={activity.progress}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>Target: {activity.target}{activity.name === "System Uptime" || activity.name === "Database Health" ? "%" : ""}</span>
                  <span>100%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest system events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Batch processing completed</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge variant="outline">Success</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registrations</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
              <Badge variant="outline">Info</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">High request volume detected</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
              <Badge variant="outline">Warning</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Database backup completed</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <Badge variant="outline">Success</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}