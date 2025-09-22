"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import FileUpload from "@/components/FileUpload"
import { useAuth } from "@/hooks/useAuth"
import { Upload, Mail, CheckCircle, AlertCircle, Clock, User, MapPin, Calendar, Phone } from "lucide-react"

interface KYCVerificationProps {
  onKYCComplete?: () => void
}

export default function KYCVerification({ onKYCComplete }: KYCVerificationProps) {
  const { user } = useAuth()
  const [kycStatus, setKycStatus] = useState<string>('not_started')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    house: '',
    street: '',
    village: '',
    city: '',
    pinCode: ''
  })

  const [showProfileForm, setShowProfileForm] = useState(false)

  // Load KYC data on component mount
  useEffect(() => {
    loadKYCData()
  }, [user])

  const loadKYCData = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setKycStatus(data.kycStatus || 'not_started')
        setPhotoUrl(data.kycPhotoUrl || '')

        // Load profile data
        setProfileData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || '',
          house: data.house || '',
          street: data.street || '',
          village: data.village || '',
          city: data.city || '',
          pinCode: data.pinCode || ''
        })
      }
    } catch (error) {
      console.error('Error loading KYC data:', error)
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleProfileDataChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfileData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/kyc/save-profile-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const result = await response.json()

      if (result.success) {
        showMessage('Profile data saved successfully!', 'success')
        setShowProfileForm(false)
        // Refresh the KYC data to show updated status
        await loadKYCData()
      } else {
        showMessage(result.error || 'Failed to save profile data', 'error')
      }
    } catch (error) {
      showMessage('Failed to save profile data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!user?.id) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/kyc/upload-photo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        console.log('Photo upload successful, URL:', result.photoUrl)
        setPhotoUrl(result.photoUrl)
        setKycStatus('photo_uploaded')
        // Refresh profile data to update KYC status in database
        await loadKYCData()
        toast.success('Photo uploaded successfully!', {
          description: 'Please complete your profile information to proceed with KYC verification.',
          duration: 4000,
        })
      } else {
        toast.error(result.error || 'Failed to upload photo', {
          description: 'Please check the file and try again.',
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error('Failed to upload photo', {
        description: 'Network error occurred. Please try again.',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  
  const handleSendOTP = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/kyc/send-otp', {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        setKycStatus('otp_sent')
        showMessage('OTP sent to your email!', 'success')
      } else {
        showMessage(result.error || 'Failed to send OTP', 'error')
      }
    } catch (error) {
      showMessage('Failed to send OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!user?.id || !otp) return

    setLoading(true)
    try {
      const response = await fetch('/api/kyc/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      })

      const result = await response.json()

      if (result.success) {
        setKycStatus('verified')
        showMessage('KYC verified successfully!', 'success')
        onKYCComplete?.()
      } else {
        showMessage(result.error || 'Failed to verify OTP', 'error')
      }
    } catch (error) {
      showMessage('Failed to verify OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (kycStatus) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'otp_sent': return 'text-blue-600 bg-blue-100'
      case 'photo_uploaded': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = () => {
    switch (kycStatus) {
      case 'verified': return 'Verified'
      case 'otp_sent': return 'OTP Sent'
      case 'photo_uploaded': return 'Photo Uploaded'
      default: return 'Not Started'
    }
  }

  const getStatusIcon = () => {
    switch (kycStatus) {
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'otp_sent': return <Clock className="w-4 h-4" />
      case 'photo_uploaded': return <Upload className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">KYC Verification</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {!photoUrl ? (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Upload Your Photo</Label>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Select Photo from Device</Label>
              <FileUpload
                onFileSelect={handlePhotoUpload}
                onError={(error) => toast.error(error, { duration: 4000 })}
                acceptedTypes=".jpg,.jpeg,.png"
                maxSize={5}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {photoUrl && photoUrl.startsWith('http') ? (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={photoUrl}
                    alt="KYC Photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', photoUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500 text-center">No valid image</span>
                </div>
              )}
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Photo Uploaded</Label>
                <p className="text-xs text-gray-600">Click below to send verification OTP</p>
                {photoUrl && (
                  <p className="text-xs text-blue-600 truncate max-w-48" title={photoUrl}>
                    URL: {photoUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

  
        {photoUrl && kycStatus !== 'verified' && (
          <div className="space-y-6">
            {/* Profile Information Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Profile Information</Label>
                </div>
                <Button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  variant="outline"
                  size="sm"
                >
                  {showProfileForm ? 'Hide' : 'Edit'} Profile
                </Button>
              </div>

              {showProfileForm && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Full Name
                      </Label>
                      <Input
                        type="text"
                        placeholder="Enter full name"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileDataChange('fullName', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={profileData.phone}
                        onChange={(e) => handleProfileDataChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Gender</Label>
                      <Select onValueChange={(value) => handleProfileDataChange('gender', value)}>
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
                      <Label className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleProfileDataChange('dateOfBirth', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Pin Code */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Pin Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter pin code"
                        value={profileData.pinCode}
                        onChange={(e) => handleProfileDataChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="w-full"
                      />
                    </div>

                    {/* House */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">House/Flat No.</Label>
                      <Input
                        type="text"
                        placeholder="Enter house/flat number"
                        value={profileData.house}
                        onChange={(e) => handleProfileDataChange('house', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Street */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Street/Road</Label>
                      <Input
                        type="text"
                        placeholder="Enter street name"
                        value={profileData.street}
                        onChange={(e) => handleProfileDataChange('street', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Village */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Village/Area</Label>
                      <Input
                        type="text"
                        placeholder="Enter village or area"
                        value={profileData.village}
                        onChange={(e) => handleProfileDataChange('village', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">City/Town</Label>
                      <Input
                        type="text"
                        placeholder="Enter city or town"
                        value={profileData.city}
                        onChange={(e) => handleProfileDataChange('city', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfileData}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Saving Profile...' : 'Save Profile Information'}
                  </Button>
                </div>
              )}
            </div>

            {/* Email Verification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-medium text-gray-700">Email Verification</Label>
              </div>

              {kycStatus === 'photo_uploaded' && (
                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </Button>
              )}

              {kycStatus === 'otp_sent' && (
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="flex-1"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button
                      onClick={handleSendOTP}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {kycStatus === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="text-green-800 font-medium">KYC Verification Complete</h4>
                <p className="text-green-700 text-sm">Your identity has been verified successfully</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}