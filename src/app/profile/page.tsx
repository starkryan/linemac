"use client"

import { useState, useEffect } from "react"
import { IndianRupee } from "lucide-react"
import { Label } from "@/components/ui/label"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"
import { useSession } from "@/lib/auth-client"

interface ProfileData {
  fullName: string
  gender: string
  dateOfBirth: string
  house: string
  street: string
  village: string
  city: string
  pinCode: string
  email: string
  phone: string
  role: string
  balance: number
  hasCorrectionData?: boolean
  correctionStatus?: string
  correctionCreatedAt?: string
}

export default function ProfilePage() {
  const { data: session, status, refresh } = useSession()
  const [enhancedSession, setEnhancedSession] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && !enhancedSession) {
      refresh().then((sessionData) => {
        if (sessionData) {
          setEnhancedSession(sessionData)
        }
      })
    }
  }, [status, enhancedSession, refresh])

  useEffect(() => {
    if (enhancedSession) {
      fetchProfileData()
    }
  }, [enhancedSession])

  const fetchProfileData = async () => {
    if (!enhancedSession?.user?.id) return

    try {
      const response = await fetch(`/api/user/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300">
            <h2 className="text-base font-semibold text-gray-800">Profile Information</h2>
          </div>
          <div className="bg-white p-4">
            <p className="text-sm text-gray-600">View and manage your personal and contact information</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Personal Information */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Full Name</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.fullName || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Gender</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.gender || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Date of Birth</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.dateOfBirth || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">City</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.city || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Account Information</h2>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">User Role</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : profileData?.role === 'operator'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profileData?.role === 'admin' ? '👑 Administrator' :
                       profileData?.role === 'operator' ? '🔧 Operator' :
                       '👤 User'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Account Status</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Contact Information</h2>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">House/Building/Apt</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.house || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Street/Road/Lane</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.street || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Village/Town/City</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.village || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Pin Code</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.pinCode || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Email</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.email || enhancedSession?.user?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 mb-2 block">Phone</Label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                    {profileData?.phone || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Correction Request Status */}
          {profileData?.hasCorrectionData && (
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Correction Request Status</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Status</Label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                      {profileData?.correctionStatus || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Created At</Label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                      {profileData?.correctionCreatedAt ? new Date(profileData.correctionCreatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Balance */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Wallet Balance</h2>
            </div>
            <div className="bg-white p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  <IndianRupee className="w-6 h-6 inline-block mr-2" />
                  {profileData?.balance?.toFixed(2) || '0.00'}
                </div>
                <p className="text-sm text-gray-600">Available Balance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}