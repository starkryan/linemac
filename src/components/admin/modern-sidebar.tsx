"use client"

import * as React from "react"
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Shield,
  Users,
  Activity,
  Database,
  Bell,
  LogOut,
  Menu,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
}

// Navigation data
const navMain = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
    tab: "overview",
    isActive: true,
  },
  {
    title: "Users",
    url: "#",
    icon: Users,
    tab: "users",
  },
  {
    title: "Requests",
    url: "#",
    icon: FileText,
    tab: "requests",
  },
  {
    title: "System Health",
    url: "#",
    icon: Activity,
    tab: "health",
  },
  {
    title: "Database",
    url: "#",
    icon: Database,
    tab: "database",
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    tab: "settings",
  },
  {
    title: "Security",
    url: "#",
    icon: Shield,
    tab: "security",
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
    tab: "notifications",
  },
]

export default function AdminSidebar({ activeTab, onTabChange, children }: AdminSidebarProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar variant="inset" className="border-r bg-sidebar">
          <SidebarHeader className="h-16 border-b bg-sidebar">
            <div className="flex items-center gap-2 px-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold">UCL Admin</h1>
                <p className="text-xs text-muted-foreground">Aadhaar Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-auto">
            <SidebarMenu className="gap-1 px-3 py-4">
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.tab}
                    onClick={() => onTabChange(item.tab)}
                    className="w-full justify-start"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.isActive && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <Separator className="my-2" />

            <SidebarMenu className="gap-1 px-3 py-2">
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.tab}
                    onClick={() => onTabChange(item.tab)}
                    className="w-full justify-start"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t bg-sidebar p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-sm font-medium">Admin User</p>
                          <p className="text-xs text-muted-foreground">admin@ucl.gov.in</p>
                        </div>
                      </div>
                      <LogOut className="h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold capitalize">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "users" && "User Management"}
                {activeTab === "requests" && "Correction Requests"}
                {activeTab === "settings" && "System Settings"}
                {activeTab === "health" && "System Health"}
                {activeTab === "database" && "Database Management"}
                {activeTab === "security" && "Security Settings"}
                {activeTab === "notifications" && "Notifications"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/50">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}