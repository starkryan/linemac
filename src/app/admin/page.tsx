"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/modern-sidebar";
import ModernDashboardStats from "@/components/admin/modern-dashboard-stats";
import ModernAnalytics from "@/components/admin/modern-analytics";
import UsersTable from "@/components/admin/users-table";
import RequestsTable from "@/components/admin/requests-table";
import AdminAuthWrapper from "@/components/admin/admin-auth-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Plus,
  Shield,
  Bell,
  Zap,
  Database,
  Palette,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Server,
  Wifi,
  WifiOff
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AdminAuthWrapper>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ModernDashboardStats />
            <ModernAnalytics />
          </div>
        )}

        {activeTab === "users" && <UsersTable />}
        {activeTab === "requests" && <RequestsTable />}

        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Server Status</span>
                  </CardTitle>
                  <CardDescription>
                    System health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disk Space</span>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5" />
                    <span>Services</span>
                  </CardTitle>
                  <CardDescription>
                    External service connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Aadhaar API</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-orange-600">Slow</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Service</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Info</span>
                  </CardTitle>
                  <CardDescription>
                    System information and uptime
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">99.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Version</span>
                    <span className="text-sm font-medium">1.2.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">1,234</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "database" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Management</span>
                </CardTitle>
                <CardDescription>
                  Database status and management tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Database Tools</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Database management features coming soon
                  </p>
                  <Button className="mt-4">
                    View Database Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send email notifications for new requests</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Auto-approval</h4>
                      <p className="text-sm text-gray-500">Automatically approve low-risk requests</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">User Registration</h4>
                      <p className="text-sm text-gray-500">Allow new user registrations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Security Configuration</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Advanced security settings and monitoring tools
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  System notifications and alerts management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Notification Center</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure notification preferences and view alerts
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AdminSidebar>
    </AdminAuthWrapper>
  );
}