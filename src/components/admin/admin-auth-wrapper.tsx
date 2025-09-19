"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

interface SessionUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  role: string
  operatorUid: string
  operatorName: string
}

interface SessionData {
  user: SessionUser
  session: {
    expiresAt: string
    token: string
    createdAt: string
    updatedAt: string
    ipAddress: string
    userAgent: string
    userId: string
    id: string
  }
}

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth-custom-session', {
          credentials: 'include',
        })

        if (response.ok) {
          const sessionData = await response.json()
          setSession(sessionData)
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
          setSession(null)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        setStatus('unauthenticated')
        setSession(null)
      }
    }

    fetchSession()
  }, [])

  useEffect(() => {
    // Debug info
    setDebugInfo({
      status,
      session: session ? {
        hasSession: true,
        userId: session.user?.id,
        email: session.user?.email,
        role: session.user?.role,
        operatorUid: session.user?.operatorUid,
        operatorName: session.user?.operatorName,
      } : null
    })

    if (status === "loading") return

    if (!session) {
      console.log("AdminAuthWrapper: No session, redirecting to login")
      router.push('/login')
      return
    }

    if (!session.user?.role || session.user.role !== 'admin') {
      console.log("AdminAuthWrapper: User role is not admin, redirecting to home. Role:", session.user?.role)
      router.push('/')
      return
    }

    console.log("AdminAuthWrapper: Access granted for admin user:", session.user?.email)
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              You don't have permission to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}