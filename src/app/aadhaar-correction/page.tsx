"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"
import PhotographSection from "@/components/PhotographSection"
import BiometricSection from "@/components/BiometricSection"
import DeviceDetector from "@/components/DeviceDetector"
import FileUpload from "@/components/FileUpload"
import { RDFingerprintCapture } from "@/components/rd-fingerprint-capture"
import { CaptureResponse } from "@/lib/rd-service"
import NotificationModal from "@/components/ui/NotificationModal"
import { BalanceService } from "@/lib/balance-service"
import { FormValidation, FormData, FormErrors } from "@/lib/form-validation"

export default function GovernmentForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("demographics")
  const [verificationMethod, setVerificationMethod] = useState("documents")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [photoCounts, setPhotoCounts] = useState({ main: 4, exception: 4 })
  const [isDOBVerified, setIsDOBVerified] = useState(false)
  const [selectedScanner, setSelectedScanner] = useState("wia-brother")
  const [fingerprintData, setFingerprintData] = useState<{
    left?: CaptureResponse;
    right?: CaptureResponse;
    thumbs?: CaptureResponse;
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [modalState, setModalState] = useState<{
    type: "error" | "warning" | "success" | "info" | "low_balance";
    title: string;
    message: string;
    open: boolean;
    onConfirm?: () => void;
  }>({
    type: "info",
    title: "",
    message: "",
    open: false,
  })
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Update Type
    updateType: '',

    // Personal Details
    name: '',
    name_hindi: '',
    gender: '',
    dob: '',
    age: '',
    aadhaar_number: '',
    mobile_number: '',
    email: '',
    npr_receipt: '',

    // Address Details
    co: '',
    co_hindi: '',
    house_no: '',
    house_no_hindi: '',
    street: '',
    street_hindi: '',
    landmark: '',
    landmark_hindi: '',
    area: '',
    area_hindi: '',
    city: '',
    city_hindi: '',
    post_office: '',
    post_office_hindi: '',
    district: '',
    district_hindi: '',
    sub_district: '',
    sub_district_hindi: '',
    state: '',
    state_hindi: '',
    pin_code: '',

    // References
    head_of_family_name: '',
    head_of_family_name_hindi: '',
    relationship: '',
    relationship_hindi: '',
    relative_aadhaar: '',
    relative_contact: '',
    same_address: false,

    // Verification Details
    dob_proof_type: '',
    identity_proof_type: '',
    address_proof_type: '',
    por_document_type: '',

    // Appointment Details
    appointment_id: '',
    residential_status: 'indian'
  })

  // Initialize form with session data
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        })

        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData?.user) {
            // Auto-populate aadhaar number from session
            setFormData(prev => ({
              ...prev,
              aadhaar_number: sessionData.user.operatorUid || '',
              mobile_number: prev.mobile_number || sessionData.user.mobile || '',
            }))
          }
        }
      } catch (error) {
        console.error('Failed to load session data:', error)
      }
    }

    loadSessionData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const showModal = (type: "error" | "warning" | "success" | "info" | "low_balance", title: string, message: string, onConfirm?: () => void) => {
    setModalState({
      type,
      title,
      message,
      open: true,
      onConfirm,
    })
  }

  const hideModal = () => {
    setModalState(prev => ({ ...prev, open: false }))
  }

  const validateAndSubmit = async () => {
    // Validate form
    const errors = FormValidation.validateForm(formData)
    setFormErrors(errors)

    if (FormValidation.hasErrors(errors)) {
      const firstError = FormValidation.getFirstError(errors)
      showModal('error', 'Validation Error', FormValidation.formatError(Object.keys(errors)[0], firstError || 'Please check your form'))
      return
    }

    // Check confirmation
    if (!confirmationChecked) {
      showModal('warning', 'Confirmation Required', 'Please confirm that all information provided is accurate before submitting.')
      return
    }

    // Check balance
    setIsCheckingBalance(true)
    try {
      const balanceCheck = await BalanceService.hasSufficientBalance(100)
      setCurrentBalance(balanceCheck.currentBalance)

      if (!balanceCheck.hasSufficient) {
        showModal(
          'low_balance',
          'Insufficient Balance',
          `You need ₹100 to submit this application. Your current balance is ₹${balanceCheck.currentBalance}.`,
          () => {
            // Redirect to recharge page
            router.push('/recharge')
          }
        )
        return
      }

      // If all checks pass, submit the form
      await submitForm()
    } catch (error) {
      console.error('Balance check error:', error)
      showModal('error', 'Balance Check Failed', 'Unable to verify your balance. Please try again.')
    } finally {
      setIsCheckingBalance(false)
    }
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      // Deduct balance first
      const deductionResult = await BalanceService.deductBalance(100)

      if (!deductionResult.success) {
        showModal('error', 'Payment Failed', deductionResult.error || 'Failed to process payment. Please try again.')
        return
      }

      // Submit the form
      const response = await fetch('/api/correction-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Include additional data like files, biometrics, etc.
          uploadedFiles,
          fingerprintData,
          verificationMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showModal('success', 'Application Submitted', 'Your Aadhaar correction application has been submitted successfully!', () => {
          router.push('/submission-status?requestId=' + result.request.id)
        })
      } else {
        // Refund balance if submission fails
        await BalanceService.deductBalance(-100) // Negative amount to refund
        showModal('error', 'Submission Failed', result.error || 'Failed to submit application. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      showModal('error', 'Submission Error', 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    await validateAndSubmit()
  }

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<{
    dobProof?: File;
    identityProof?: File;
    addressProof?: File;
    porDocument?: File;
  }>({})

  const tabs = [
    { id: "demographics", label: "Demographics", enabled: true },
    { id: "references", label: "References", enabled: true },
    { id: "photograph", label: "Photograph", enabled: true },
    { id: "fingerprints", label: "Fingerprints", enabled: true },
    { id: "iris", label: "Iris", enabled: true },
    { id: "review", label: "Review", enabled: true },
  ]

  const handleTabClick = (tabId: string) => {
    if (tabs.find((tab) => tab.id === tabId)?.enabled) {
      setActiveTab(tabId)
    }
  }

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(activeTab)) {
        setCompletedSteps([...completedSteps, activeTab])
      }
      setActiveTab(tabs[currentIndex + 1].id)
    }
  }

  const handleFingerprintCapture = (type: 'left' | 'right' | 'thumbs', data: CaptureResponse) => {
    setFingerprintData(prev => ({
      ...prev,
      [type]: data
    }));
  };

  // File handler functions
  const handleFileSelect = (fileType: 'dobProof' | 'identityProof' | 'addressProof' | 'porDocument', file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }))
  }

  const handleFileView = (fileType: string) => {
    const file = uploadedFiles[fileType as keyof typeof uploadedFiles]
    if (file) {
      // Create object URL for viewing
      const url = URL.createObjectURL(file)
      window.open(url, '_blank')
    }
  }

  const handleFileRemove = (fileType: 'dobProof' | 'identityProof' | 'addressProof' | 'porDocument') => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: undefined
    }))
  }

  const getTabIcon = (tabId: string) => {
    if (completedSteps.includes(tabId)) {
      return <Image src="/green-tick-icon.png" alt="Completed" width={20} height={20} className="w-5 h-5" />
    }
    return <Image src="/red-square-icon.png" alt="Pending" width={20} height={20} className="w-5 h-5" />
  }

  const getTabStyling = (tabId: string) => {
    if (tabId === activeTab) {
      return "bg-orange-500 text-white" // Orange background for active
    }
    return "bg-gray-700 text-white" // Gray background for all others
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
      {/* Navigation Tabs */}
      <div className="bg-gray-800 flex">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`px-4 py-3 text-sm font-medium border-l border-gray-600 cursor-pointer flex items-center gap-3 ${getTabStyling(tab.id)} hover:opacity-90`}
            onClick={() => handleTabClick(tab.id)}
          >
            {getTabIcon(tab.id)}
            {tab.label}
          </div>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === "demographics" && (
          <>
            {/* Residential Status Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Residential Status</h2>
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Resident Type</span>
                    <span className="text-red-600 font-bold text-base">✱</span>
                    <span className="text-gray-400 text-xs">⊙</span>
                  </div>
                  <RadioGroup defaultValue="indian" className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="indian" id="indian" className="border-gray-400" />
                      <Label htmlFor="indian" className="text-sm text-gray-700">
                        Indian Resident
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nri" id="nri" className="border-gray-400" />
                      <Label htmlFor="nri" className="text-sm text-gray-700">
                        Non Resident Indian (NRI)
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="ml-auto text-sm text-gray-700">
                    निवासी प्रकार <span className="text-red-600 font-bold text-base">✱</span> भारतीय निवासी
                  </div>
                </div>
              </div>
            </div>

            {/* Update Type Selection Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">What do you want to update?</h2>
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Choose what to update</span>
                    <span className="text-red-600 font-bold text-base">✱</span>
                    <span className="text-gray-400 text-xs">⊙</span>
                  </div>
                  <RadioGroup
                    value={formData.updateType}
                    onValueChange={(value) => handleInputChange("updateType", value)}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="name" id="update-name" className="border-gray-400" />
                      <Label htmlFor="update-name" className="text-sm text-gray-700">
                        Name
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dob" id="update-dob" className="border-gray-400" />
                      <Label htmlFor="update-dob" className="text-sm text-gray-700">
                        Date of Birth
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="address" id="update-address" className="border-gray-400" />
                      <Label htmlFor="update-address" className="text-sm text-gray-700">
                        Address
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile" id="update-mobile" className="border-gray-400" />
                      <Label htmlFor="update-mobile" className="text-sm text-gray-700">
                        Mobile
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="photo" id="update-photo" className="border-gray-400" />
                      <Label htmlFor="update-photo" className="text-sm text-gray-700">
                        Photo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="biometric" id="update-biometric" className="border-gray-400" />
                      <Label htmlFor="update-biometric" className="text-sm text-gray-700">
                        Biometric
                      </Label>
                    </div>
                                      </RadioGroup>
                  {formErrors.updateType && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.updateType}</p>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Select the type of update you want to perform. The form will show relevant sections based on your selection.
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Appointment details</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Appointment ID</Label>
                    <Input
                      className="bg-white border-gray-400 h-8"
                      value={formData.appointment_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointment_id: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Personal Details</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Name <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter full name"
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.name_hindi}
                        onChange={(e) => handleInputChange("name_hindi", e.target.value)}
                        placeholder="नाम दर्ज करें"
                      />
                    </div>
                  </div>

                  {/* Gender Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Gender <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.gender && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        लिंग <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                    </div>
                  </div>

                  {/* Age/DOB Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block flex items-center gap-1">
                        Age/DOB <span className="text-red-600 font-bold text-base">✱</span>
                        <span className="text-gray-400 text-xs">⊙</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          className="bg-white border-gray-400 w-16 h-8"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          placeholder=""
                        />
                        <span className="text-gray-500 text-sm">OR</span>
                        <Input
                          className="bg-white border-gray-400 w-32 h-8"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          placeholder="DD/MM/YYYY"
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="dob-verified"
                            checked={isDOBVerified}
                            onCheckedChange={(checked) => setIsDOBVerified(checked as boolean)}
                            className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <Label
                            htmlFor="dob-verified"
                            className={`text-sm cursor-pointer ${isDOBVerified ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                          >
                            {isDOBVerified ? '✓ Verified' : 'Verify'}
                          </Label>
                        </div>
                      </div>
                      {formErrors.dob && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        आयु या जन्म तिथि <span className="text-red-600 font-bold text-base">✱</span> रूप
                      </Label>
                    </div>
                  </div>

                  {/* NPR Receipt Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">NPR Receipt/TIN No.</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.npr_receipt}
                        onChange={(e) => handleInputChange("npr_receipt", e.target.value)}
                        placeholder="Enter NPR receipt number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div>
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-800">Contact Details</h2>
                <Button variant="outline" size="sm" className="bg-white border-gray-400 h-8 px-3 text-xs">
                  Copy Previous
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Mobile Number Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Mobile Number <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.mobile_number}
                        onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                      />
                      {formErrors.mobile_number && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.mobile_number}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        मोबाइल नंबर <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.mobile_number}
                        onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        disabled
                      />
                    </div>
                  </div>

                  {/* C/O Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">C/O</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.co}
                        onChange={(e) => handleInputChange("co", e.target.value)}
                        placeholder="Care of"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">द्वारा</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.co_hindi}
                        onChange={(e) => handleInputChange("co_hindi", e.target.value)}
                        placeholder="द्वारा"
                      />
                    </div>
                  </div>

                  {/* House/Bldg/Apt Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">House/Bldg/Apt</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.house_no}
                        onChange={(e) => handleInputChange("house_no", e.target.value)}
                        placeholder="House/Building/Apartment number"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">घर/निर्माण</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.house_no_hindi}
                        onChange={(e) => handleInputChange("house_no_hindi", e.target.value)}
                        placeholder="घर/निर्माण संख्या"
                      />
                    </div>
                  </div>

                  {/* Street/Road/Lane Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Street/Road/Lane</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        placeholder="Street, Road, or Lane"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">सड़क/मार्ग/गली</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.street_hindi}
                        onChange={(e) => handleInputChange("street_hindi", e.target.value)}
                        placeholder="सड़क/मार्ग/गली"
                      />
                    </div>
                  </div>

                  {/* Landmark Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Landmark</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.landmark}
                        onChange={(e) => handleInputChange("landmark", e.target.value)}
                        placeholder="Nearby landmark"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">स्थान चिह्न</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.landmark_hindi}
                        onChange={(e) => handleInputChange("landmark_hindi", e.target.value)}
                        placeholder="स्थान चिह्न"
                      />
                    </div>
                  </div>

                  {/* Area/Locality/Sector Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Area/Locality/Sector</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        placeholder="Area, Locality, or Sector"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">स्थान</Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.area_hindi}
                        onChange={(e) => handleInputChange("area_hindi", e.target.value)}
                        placeholder="स्थान/क्षेत्र"
                      />
                    </div>
                  </div>

                  {/* Village/Town/City Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Village/Town/City <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter city name"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        गांव/कस्बा/शहर <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.city_hindi}
                        onChange={(e) => handleInputChange("city_hindi", e.target.value)}
                        placeholder="गांव/कस्बा/शहर"
                      />
                    </div>
                  </div>

                  {/* Additional address fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        District <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        placeholder="Enter district"
                      />
                      {formErrors.district && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        State <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Enter state"
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        PIN Code <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.pin_code}
                        onChange={(e) => handleInputChange("pin_code", e.target.value)}
                        placeholder="Enter 6-digit PIN code"
                      />
                      {formErrors.pin_code && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.pin_code}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        पिन कोड <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.pin_code}
                        onChange={(e) => handleInputChange("pin_code", e.target.value)}
                        placeholder="6 अंकों का पिन कोड"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "references" && (
          <>
            {/* Scanner Configuration Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Scanner configuration</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Scanner Row */}
                  <div className="flex items-start gap-4">
                    <Label className="text-sm text-gray-700 w-20 pt-2">Scanner</Label>
                    <div className="flex-1">
                      <DeviceDetector
                        onDeviceSelect={setSelectedScanner}
                        selectedDevice={selectedScanner}
                      />
                    </div>
                  </div>

                  {/* Scan Mode Row */}
                  <div className="flex items-center gap-4">
                    <Label className="text-sm text-gray-700 w-20">Scan mode</Label>
                    <RadioGroup defaultValue="color" className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="color" className="border-gray-400" />
                        <Label htmlFor="color" className="text-sm text-gray-700">
                          Color
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grayscale" id="grayscale" className="border-gray-400" />
                        <Label htmlFor="grayscale" className="text-sm text-gray-700">
                          Grayscale
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="black-white" id="black-white" className="border-gray-400" />
                        <Label htmlFor="black-white" className="text-sm text-gray-700">
                          Black & White
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Date of Birth Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Proof of Date of Birth</h2>
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm text-gray-700 w-32">Date of Birth Proof</Label>
                  <Select>
                    <SelectTrigger className="bg-white border-gray-400 h-8 w-80">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birth-certificate">Birth Certificate</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  <FileUpload
                    onFileSelect={(file) => handleFileSelect('dobProof', file)}
                    onFileView={() => handleFileView('dobProof')}
                    onFileRemove={() => handleFileRemove('dobProof')}
                    acceptedTypes=".pdf,.jpg,.jpeg,.png"
                    maxSize={5}
                  />
                </div>
              </div>
            </div>

            {/* Identity and Address Verification Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Identity and Address Verification</h2>
              </div>
              <div className="bg-white p-4">
                <RadioGroup value={verificationMethod} onValueChange={setVerificationMethod} className="space-y-4">
                  {/* Verify using supporting documents */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="documents" id="documents" className="border-gray-400" />
                      <Label htmlFor="documents" className="text-sm text-gray-700">
                        Verify using supporting documents
                      </Label>
                    </div>

                    {/* Identity Proof Row - only show when documents is selected */}
                    {verificationMethod === "documents" && (
                      <>
                        <div className="flex items-center gap-4 ml-6">
                          <Label className="text-sm text-gray-700 w-24">Identity Proof</Label>
                          <Select>
                            <SelectTrigger className="bg-white border-gray-400 h-8 w-80">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aadhar">Aadhar Card</SelectItem>
                              <SelectItem value="pan">PAN Card</SelectItem>
                              <SelectItem value="passport">Passport</SelectItem>
                            </SelectContent>
                          </Select>
                          <FileUpload
                            onFileSelect={(file) => handleFileSelect('identityProof', file)}
                            onFileView={() => handleFileView('identityProof')}
                            onFileRemove={() => handleFileRemove('identityProof')}
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                          />
                        </div>

                        {/* Address Proof Row */}
                        <div className="flex items-center gap-4 ml-6">
                          <Label className="text-sm text-gray-700 w-24">Address Proof</Label>
                          <Select>
                            <SelectTrigger className="bg-white border-gray-400 h-8 w-80">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utility-bill">Utility Bill</SelectItem>
                              <SelectItem value="bank-statement">Bank Statement</SelectItem>
                              <SelectItem value="rent-agreement">Rent Agreement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FileUpload
                            onFileSelect={(file) => handleFileSelect('addressProof', file)}
                            onFileView={() => handleFileView('addressProof')}
                            onFileRemove={() => handleFileRemove('addressProof')}
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Head of Family verification */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="family-head" id="family-head" className="border-gray-400" />
                      <Label htmlFor="family-head" className="text-sm text-gray-700">
                        Head of Family shall verify the resident's identity/address.
                      </Label>
                    </div>

                    {/* POR Document Row - only show when family-head is selected */}
                    {verificationMethod === "family-head" && (
                      <div className="flex items-center gap-4 ml-6">
                        <Label className="text-sm text-gray-700 w-24">POR Document</Label>
                        <Select>
                          <SelectTrigger className="bg-white border-gray-400 h-8 w-80">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="por1">POR Document 1</SelectItem>
                            <SelectItem value="por2">POR Document 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FileUpload
                          onFileSelect={(file) => handleFileSelect('porDocument', file)}
                          onFileView={() => handleFileView('porDocument')}
                          onFileRemove={() => handleFileRemove('porDocument')}
                          acceptedTypes=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                        />
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Relative Details Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Relative Details</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Head of Family Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Head of Family Name <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.head_of_family_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, head_of_family_name: e.target.value }))}
                          />
                      </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        परिवार के मुखिया का नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        value={formData.head_of_family_name_hindi}
                        onChange={(e) => setFormData(prev => ({ ...prev, head_of_family_name_hindi: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Relationship Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Relationship <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                      >
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="husband">Husband</SelectItem>
                          <SelectItem value="wife">Wife</SelectItem>
                          <SelectItem value="son">Son</SelectItem>
                          <SelectItem value="daughter">Daughter</SelectItem>
                          <SelectItem value="brother">Brother</SelectItem>
                          <SelectItem value="sister">Sister</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        संबंध <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select
                        value={formData.relationship_hindi}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, relationship_hindi: value }))}
                      >
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">पिता</SelectItem>
                          <SelectItem value="mother">माता</SelectItem>
                          <SelectItem value="husband">पति</SelectItem>
                          <SelectItem value="wife">पत्नी</SelectItem>
                          <SelectItem value="son">पुत्र</SelectItem>
                          <SelectItem value="daughter">पुत्री</SelectItem>
                          <SelectItem value="brother">भ्राता</SelectItem>
                          <SelectItem value="sister">भगिनी</SelectItem>
                          <SelectItem value="other">अन्य</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Relative's Aadhaar Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Relative's Aadhaar Number
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        placeholder="Enter 12-digit Aadhaar number"
                        value={formData.relative_aadhaar}
                        onChange={(e) => setFormData(prev => ({ ...prev, relative_aadhaar: e.target.value }))}
                        />
                        </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        संबंधित की आधार संख्या
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="12 अंकों की आधार संख्या दर्ज करें" />
                    </div>
                  </div>

                  {/* Relative's Contact Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Relative's Contact Number
                      </Label>
                      <Input
                        className="bg-white border-gray-400 h-8"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.relative_contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, relative_contact: e.target.value }))}
                          />
                          </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        संबंधित का संपर्क नंबर
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>

                  {/* Same Address Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-address"
                      className="border-gray-400"
                      checked={formData.same_address}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, same_address: checked as boolean }))}
                    />
                    <Label htmlFor="same-address" className="text-sm text-gray-700">
                      Relative's address is same as applicant's address
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "photograph" && (
          <PhotographSection
            onPhotoCountChange={(mainCount, exceptionCount) => {
              setPhotoCounts({ main: mainCount, exception: exceptionCount })
            }}
          />
        )}

        {activeTab === "fingerprints" && (
          <BiometricSection
            mode="fingerprints"
            deviceType="both"
            onFingerprintCapture={(type, data) => {
              // Convert the new format to the existing format for compatibility
              const captureResponse: CaptureResponse = {
                pidData: data.data,
                score: data.quality,
                status: "success"
              }
              handleFingerprintCapture(type, captureResponse)
            }}
          />
        )}

        {activeTab === "iris" && (
          <BiometricSection
            mode="iris"
            onIrisCapture={(type, data) => {
              // Handle iris capture (new functionality)
              console.log('Iris captured:', type, data)
            }}
          />
        )}

        {activeTab === "review" && (
          <>
            {/* Review Summary Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Application Review Summary</h2>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm text-gray-600 mb-4">
                  Please review all the information entered before final submission. Click on any section to edit.
                </div>
              </div>
            </div>

            {/* Demographics Review */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">Demographics Information</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-400 h-8 px-3 text-xs"
                  onClick={() => setActiveTab("demographics")}
                >
                  Edit
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="mb-2">
                      <strong>Residential Status:</strong> Indian Resident
                    </div>
                    <div className="mb-2">
                      <strong>Aadhaar Number:</strong> {formData.aadhaar_number || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Name:</strong> {formData.name || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Gender:</strong> {formData.gender || '[To be selected]'}
                    </div>
                    <div className="mb-2">
                      <strong>Age/DOB:</strong> {formData.dob || '[To be filled]'} {isDOBVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                    </div>
                    <div className="mb-2">
                      <strong>NPR Receipt/TIN No.:</strong> {formData.npr_receipt || '[To be filled]'}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <strong>निवासी प्रकार:</strong> भारतीय निवासी
                    </div>
                    <div className="mb-2">
                      <strong>आधार संख्या:</strong> {formData.aadhaar_number || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>नाम:</strong> {formData.name_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>लिंग:</strong> {formData.gender ? (formData.gender === 'Male' ? 'पुरुष' : formData.gender === 'Female' ? 'महिला' : 'अन्य') : '[चुना जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>आयु या जन्म तिथि:</strong> {formData.dob || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>गांव/कस्बा/शहर:</strong> {formData.city_hindi || '[भरा जाना है]'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Review */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">Contact Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-400 h-8 px-3 text-xs"
                  onClick={() => setActiveTab("demographics")}
                >
                  Edit
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="mb-2">
                      <strong>C/O:</strong> {formData.co || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>House/Bldg/Apt:</strong> {formData.house_no || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Street/Road/Lane:</strong> {formData.street || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Landmark:</strong> {formData.landmark || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Area/Locality/Sector:</strong> {formData.area || '[To be filled]'}
                    </div>
                    <div className="mb-2">
                      <strong>Village/Town/City:</strong> {formData.city || '[To be filled]'}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <strong>द्वारा:</strong> {formData.co_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>घर/निर्माण:</strong> {formData.house_no_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>सड़क/मार्ग/गली:</strong> {formData.street_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>स्थान चिह्न:</strong> {formData.landmark_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>स्थान:</strong> {formData.area_hindi || '[भरा जाना है]'}
                    </div>
                    <div className="mb-2">
                      <strong>गांव/कस्बा/शहर:</strong> {formData.city_hindi || '[भरा जाना है]'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* References Review */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">References & Documents</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-400 h-8 px-3 text-xs"
                  onClick={() => setActiveTab("references")}
                >
                  Edit
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Scanner Configuration:</strong> {selectedScanner === 'wia-brother' ? 'WIA-Brother Scanner c1 #2' : selectedScanner} (Color Mode)
                  </div>
                  <div>
                    <strong>Date of Birth Proof:</strong> {formData.dob_proof_type || '[To be selected]'}
                  </div>
                  <div>
                    <strong>Verification Method:</strong>{" "}
                    {verificationMethod === "documents" ? "Supporting Documents" : "Head of Family Verification"}
                  </div>
                  {verificationMethod === "documents" && (
                    <>
                      <div>
                        <strong>Identity Proof:</strong> {formData.identity_proof_type || '[To be selected]'}
                      </div>
                      <div>
                        <strong>Address Proof:</strong> {formData.address_proof_type || '[To be selected]'}
                      </div>
                    </>
                  )}
                  {verificationMethod === "family-head" && (
                    <div>
                      <strong>POR Document:</strong> {formData.por_document_type || '[To be selected]'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photograph Review */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">Photograph Capture</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-400 h-8 px-3 text-xs"
                  onClick={() => setActiveTab("photograph")}
                >
                  Edit
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Main Photograph:</strong> {photoCounts.main === 4 ? "Not captured" : `${4 - photoCounts.main} photo(s) captured`} ({photoCounts.main} remaining)
                  </div>
                  <div>
                    <strong>Exception Photograph:</strong> {photoCounts.exception === 4 ? "Not captured" : `${4 - photoCounts.exception} photo(s) captured`} ({photoCounts.exception} remaining)
                  </div>
                  <div>
                    <strong>Status:</strong> {photoCounts.main === 4 && photoCounts.exception === 4 ? "Pending" : "In Progress"}
                  </div>
                </div>
              </div>
            </div>

            {/* Fingerprints Review */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">Fingerprint Capture</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-400 h-8 px-3 text-xs"
                  onClick={() => setActiveTab("fingerprints")}
                >
                  Edit
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Left Hand:</strong> Not captured (4 remaining) - Score: 0%
                  </div>
                  <div>
                    <strong>Right Hand:</strong> Not captured (4 remaining) - Score: 0%
                  </div>
                  <div>
                    <strong>Both Thumbs:</strong> Not captured (4 remaining) - Score: 0%
                  </div>
                </div>
              </div>
            </div>

            {/* Final Submission Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h3 className="text-base font-semibold text-gray-800">Final Submission</h3>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm text-gray-600 mb-4">
                  By clicking "Submit Application", you confirm that all the information provided is accurate and
                  complete.
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="confirm"
                    className="border-gray-400"
                    checked={confirmationChecked}
                    onChange={(e) => setConfirmationChecked(e.target.checked)}
                  />
                  <Label htmlFor="confirm" className="text-sm text-gray-700">
                    I confirm that all information provided is accurate and I understand that providing false
                    information is a punishable offense.
                  </Label>
                </div>
                <Button
                  className="bg-green-600 text-white px-8 py-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !confirmationChecked}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            className="bg-white border-gray-400 px-6 flex items-center gap-2"
            onClick={() => {
              const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id)
              }
            }}
            disabled={activeTab === "demographics"}
          >
            <AadhaarIcon mirrored />
            Previous
          </Button>
          {activeTab !== "review" && (
            <Button
              variant="outline"
              className="bg-white border-gray-400 px-6 flex items-center gap-2"
              onClick={handleNext}
            >
              Next
              <AadhaarIcon />
            </Button>
          )}
        </div>
      </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        open={modalState.open}
        onOpenChange={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.type === 'low_balance' ? 'Recharge Now' : 'OK'}
        balance={modalState.type === 'low_balance' ? currentBalance : undefined}
      />
    </AuthenticatedLayout>
  )
}
