"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import FileUpload from "@/components/FileUpload"
import { useAuth } from "@/hooks/useAuth"
import { Upload, Mail, CheckCircle, AlertCircle, Clock, User, MapPin, Calendar, Phone, Shield, Timer } from "lucide-react"

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
  const [otpResendTimer, setOtpResendTimer] = useState<number>(0)
  const [otpProgress, setOtpProgress] = useState<number>(0)
  
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

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer(prev => {
          const newTimer = prev - 1
          if (newTimer <= 0) {
            clearInterval(interval)
            return 0
          }
          setOtpProgress(((60 - newTimer) / 60) * 100)
          return newTimer
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpResendTimer])

  const loadKYCData = async () => {
    if (!user?.id) return

    try {
      let response = await fetch('/api/kyc/status')
      if (!response.ok) {
        // Fallback to user profile API
        response = await fetch('/api/user/profile')
      }

      if (response.ok) {
        const data = await response.json()
        const kycStatus = data.success ? data.kycStatus : data.kycStatus
        setKycStatus(kycStatus || 'not_started')

        // Validate and set photo URL
        const photoUrl = data.success ? data.kycPhotoUrl : data.kycPhotoUrl || ''
        if (photoUrl && isValidUrl(photoUrl)) {
          setPhotoUrl(photoUrl)
        } else {
          console.warn('Invalid or missing photo URL:', photoUrl)
          setPhotoUrl('')
        }

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

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const checkImageAccessibility = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const contentType = response.headers.get('content-type')
      return response.ok && contentType ? contentType.startsWith('image/') : false
    } catch {
      return false
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const showImageError = () => {
    showMessage('Profile photo is currently unavailable. Please try uploading again.', 'error')
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
        setOtpResendTimer(60) // Start 60-second timer
        setOtpProgress(0)
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
      case 'verified': return 'bg-green-500'
      case 'otp_sent': return 'bg-blue-500'
      case 'photo_uploaded': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      case 'otp_sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          OTP Sent
        </Badge>
      case 'photo_uploaded':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Upload className="w-3 h-3 mr-1" />
          Photo Uploaded
        </Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg">KYC Verification</CardTitle>
                <CardDescription>Complete your identity verification process</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Status Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          messageType === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Progress Indicator */}
      {kycStatus !== 'not_started' && kycStatus !== 'verified' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Verification Progress</span>
                <span className="text-gray-600">
                  {kycStatus === 'photo_uploaded' ? '33%' : '66%'}
                </span>
              </div>
              <Progress
                value={kycStatus === 'photo_uploaded' ? 33 : 66}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Photo Upload</span>
                <span>Email Verification</span>
                <span>Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      {kycStatus !== 'verified' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Your Photo
            </CardTitle>
            <CardDescription>
              Select a clear photo of yourself for identity verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handlePhotoUpload}
              onError={(error) => toast.error(error, { duration: 4000 })}
              acceptedTypes=".jpg,.jpeg,.png"
              maxSize={5}
              className="w-full"
            />
          </CardContent>
        </Card>
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
                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium mb-2 block">Enter 6-digit OTP</Label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        className="justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                          <InputOTPSlot index={1} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                          <InputOTPSlot index={2} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                          <InputOTPSlot index={3} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                          <InputOTPSlot index={4} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                          <InputOTPSlot index={5} className="w-12 h-12 border-2 border-green-300 rounded-md bg-white text-lg font-semibold" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {/* Timer and Resend */}
                  {otpResendTimer > 0 && (
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                        <Timer className="w-4 h-4" />
                        Resend OTP in {otpResendTimer}s
                      </div>
                      <Progress value={otpProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button
                      onClick={handleSendOTP}
                      disabled={loading || otpResendTimer > 0}
                      variant="outline"
                      className="flex-1"
                    >
                      {otpResendTimer > 0 ? `Wait ${otpResendTimer}s` : 'Resend OTP'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {kycStatus === 'verified' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">KYC Verification Complete</h3>
                  <p className="text-green-700">Your identity has been verified successfully</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
}