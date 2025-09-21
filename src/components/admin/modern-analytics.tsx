"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for charts
const requestData = [
  { date: "Jan", submitted: 400, approved: 240, rejected: 160 },
  { date: "Feb", submitted: 300, approved: 198, rejected: 102 },
  { date: "Mar", submitted: 200, approved: 160, rejected: 40 },
  { date: "Apr", submitted: 278, approved: 189, rejected: 89 },
  { date: "May", submitted: 189, approved: 149, rejected: 40 },
  { date: "Jun", submitted: 239, approved: 179, rejected: 60 },
]

const userData = [
  { date: "Jan", registered: 100, active: 85 },
  { date: "Feb", registered: 120, active: 95 },
  { date: "Mar", registered: 90, active: 80 },
  { date: "Apr", registered: 150, active: 130 },
  { date: "May", registered: 180, active: 160 },
  { date: "Jun", registered: 200, active: 185 },
]

const performanceData = [
  { time: "00:00", cpu: 20, memory: 30, requests: 50 },
  { time: "04:00", cpu: 15, memory: 25, requests: 30 },
  { time: "08:00", cpu: 45, memory: 55, requests: 200 },
  { time: "12:00", cpu: 65, memory: 70, requests: 350 },
  { time: "16:00", cpu: 55, memory: 60, requests: 280 },
  { time: "20:00", cpu: 35, memory: 45, requests: 150 },
  { time: "24:00", cpu: 25, memory: 35, requests: 80 },
]

export default function ModernAnalytics() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="requests" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <Select defaultValue="30d">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Overview</CardTitle>
                <CardDescription>
                  Monthly request statistics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submitted" fill="hsl(var(--primary))" />
                    <Bar dataKey="approved" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="rejected" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Rate</CardTitle>
                <CardDescription>
                  Monthly approval percentage trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestData.map(item => ({
                    date: item.date,
                    rate: ((item.approved / item.submitted) * 100).toFixed(1)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Status Distribution</CardTitle>
              <CardDescription>
                Current status of all requests in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,234</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                  <Badge variant="outline" className="mt-2">+12.5%</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">456</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <Badge variant="outline" className="mt-2">-2.1%</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">123</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                  <Badge variant="outline" className="mt-2">-8.3%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="registered" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                    <Area type="monotone" dataKey="active" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Daily active users vs registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registered" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="active" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  CPU and Memory usage over 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.2)" />
                    <Area type="monotone" dataKey="memory" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>
                  API requests per hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}