"use client"

import { useState, useEffect } from "react"
import { IndianRupee, Edit, Save, X, User, MapPin, Phone, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"
import { useAuth } from "@/hooks/useAuth"
import KYCVerification from "@/components/KYCVerification"

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
  kycStatus?: string
  kycPhotoUrl?: string
  kycVerifiedAt?: string
}

export default function ProfilePage() {
  const { user, session: authSession, loading, isAuthenticated } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    house: '',
    street: '',
    village: '',
    city: '',
    pinCode: '',
    phone: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfileData()
    }
  }, [isAuthenticated, user])

  const fetchProfileData = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/user/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        // Initialize edit form with current data
        setEditForm({
          fullName: data.fullName || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || '',
          house: data.house || '',
          street: data.street || '',
          village: data.village || '',
          city: data.city || '',
          pinCode: data.pinCode || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const startEditing = () => {
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    // Reset form to current profile data
    if (profileData) {
      setEditForm({
        fullName: profileData.fullName || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth || '',
        house: profileData.house || '',
        street: profileData.street || '',
        village: profileData.village || '',
        city: profileData.city || '',
        pinCode: profileData.pinCode || '',
        phone: profileData.phone || ''
      })
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveProfile = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const response = await fetch('/api/kyc/save-profile-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()

      if (result.success) {
        setProfileData(result.user)
        setEditing(false)
        toast.success('Profile updated successfully!', {
          description: 'Your profile information has been saved.',
          duration: 4000,
        })
      } else {
        toast.error(result.error || 'Failed to update profile', {
          description: 'Please check your information and try again.',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/loader.gif"
              alt="Loading profile..."
              width={64}
              height={64}
              className="mx-auto animate-pulse mb-4"
            />
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
          <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">Profile Information</h2>
            {!editing && (
              <Button
                onClick={startEditing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
          <div className="bg-white p-4">
            <p className="text-sm text-gray-600">View and manage your personal and contact information</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Profile Completion Notice */}
          {!editing && (profileData?.fullName === 'Not provided' || !profileData?.fullName ||
            profileData?.gender === 'Not provided' || !profileData?.gender ||
            profileData?.dateOfBirth === 'Not provided' || !profileData?.dateOfBirth ||
            profileData?.phone === 'Not provided' || !profileData?.phone ||
            profileData?.house === 'Not provided' || !profileData?.house ||
            profileData?.city === 'Not provided' || !profileData?.city) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Edit className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-800 font-semibold">Complete Your Profile</h3>
                    <p className="text-amber-700 text-sm">Some of your profile information is missing. Click "Edit Profile" to fill in your details.</p>
                  </div>
                </div>
                <Button
                  onClick={startEditing}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="bg-white p-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Full Name
                      </Label>
                      <Input
                        type="text"
                        placeholder="Enter full name"
                        value={editForm.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Gender</Label>
                      <Select onValueChange={(value) => handleFormChange('gender', value)} value={editForm.gender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={editForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
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
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* House */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">House/Building/Apt</Label>
                      <Input
                        type="text"
                        placeholder="Enter house/flat number"
                        value={editForm.house}
                        onChange={(e) => handleFormChange('house', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Street */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Street/Road/Lane</Label>
                      <Input
                        type="text"
                        placeholder="Enter street name"
                        value={editForm.street}
                        onChange={(e) => handleFormChange('street', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Village */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Village/Area</Label>
                      <Input
                        type="text"
                        placeholder="Enter village or area"
                        value={editForm.village}
                        onChange={(e) => handleFormChange('village', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">City/Town</Label>
                      <Input
                        type="text"
                        placeholder="Enter city or town"
                        value={editForm.city}
                        onChange={(e) => handleFormChange('city', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Pin Code */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Pin Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter pin code"
                        value={editForm.pinCode}
                        onChange={(e) => handleFormChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="w-full"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Email</Label>
                      <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                        {user?.email || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                      {profileData?.email || user?.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Phone</Label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                      {profileData?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              )}
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

          {/* Action Buttons (when editing) */}
          {editing && (
            <div className="mb-6">
              <div className="bg-white p-4">
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* KYC Verification */}
          <div className="mb-6">
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">KYC Verification</h2>
            </div>
            <div className="bg-white p-4">
              <KYCVerification />
            </div>
          </div>

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