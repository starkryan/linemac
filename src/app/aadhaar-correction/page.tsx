"use client"

import { useState } from "react"
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

  // Form state
  const [formData, setFormData] = useState({
    aadhaar_number: '',
    mobile_number: '',
    name: '',
    gender: '',
    dob: '',
    email: '',
    co: '',
    house_no: '',
    street: '',
    landmark: '',
    area: '',
    city: '',
    post_office: '',
    district: '',
    sub_district: '',
    state: '',
    pin_code: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!confirmationChecked) {
      alert('Please confirm the information is accurate before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/correction-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert('Application submitted successfully!')
        router.push('/submission-status?requestId=' + result.request.id)
      } else {
        alert(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

            {/* Appointment Details Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Appointment details</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Appointment ID</Label>
                    <Input className="bg-white border-gray-400 h-8" />
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
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Gender Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Gender <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input className="bg-white border-gray-400 w-16 h-8" placeholder="" />
                        <span className="text-gray-500 text-sm">OR</span>
                        <Input className="bg-white border-gray-400 w-12 h-8" placeholder="DD" />
                        <Input className="bg-white border-gray-400 w-12 h-8" placeholder="MM" />
                        <Input className="bg-white border-gray-400 w-16 h-8" placeholder="YYYY" />
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
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div>
              <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-800">Contact Details (Default)</h2>
                <Button variant="outline" size="sm" className="bg-white border-gray-400 h-8 px-3 text-xs">
                  Copy Previous
                </Button>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* C/O Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">C/O</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">द्वारा</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* House/Bldg/Apt Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">House/Bldg/Apt</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">घर/निर्माण</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Street/Road/Lane Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Street/Road/Lane</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">सड़क/मार्ग/गली</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Landmark Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Landmark</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">स्थान चिह्न</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Area/Locality/Sector Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">Area/Locality/Sector</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">स्थान</Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Village/Town/City Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Village/Town/City <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        गांव/कस्बा/शहर <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" />
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
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        परिवार के मुखिया का नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" />
                    </div>
                  </div>

                  {/* Relationship Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Relationship <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select>
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
                      <Select>
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
                      <Input className="bg-white border-gray-400 h-8" placeholder="Enter 12-digit Aadhaar number" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        संबंधित की आधार संख्या
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="Enter 12-digit Aadhaar number" />
                    </div>
                  </div>

                  {/* Relative's Contact Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Relative's Contact Number
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="+91 XXXXX XXXXX" />
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
                    <Checkbox id="same-address" className="border-gray-400" />
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
                      <strong>Name:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>Gender:</strong> [To be selected]
                    </div>
                    <div className="mb-2">
                      <strong>Age/DOB:</strong> [To be filled] {isDOBVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                    </div>
                    <div className="mb-2">
                      <strong>NPR Receipt/TIN No.:</strong> [To be filled]
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <strong>निवासी प्रकार:</strong> भारतीय निवासी
                    </div>
                    <div className="mb-2">
                      <strong>नाम:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>लिंग:</strong> [चुना जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>आयु या जन्म तिथि:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>गांव/कस्बा/शहर:</strong> [भरा जाना है]
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
                      <strong>C/O:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>House/Bldg/Apt:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>Street/Road/Lane:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>Landmark:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>Area/Locality/Sector:</strong> [To be filled]
                    </div>
                    <div className="mb-2">
                      <strong>Village/Town/City:</strong> [To be filled]
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <strong>द्वारा:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>घर/निर्माण:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>सड़क/मार्ग/गली:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>स्थान चिह्न:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>स्थान:</strong> [भरा जाना है]
                    </div>
                    <div className="mb-2">
                      <strong>गांव/कस्बा/शहर:</strong> [भरा जाना है]
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
                    <strong>Date of Birth Proof:</strong> [To be selected]
                  </div>
                  <div>
                    <strong>Verification Method:</strong>{" "}
                    {verificationMethod === "documents" ? "Supporting Documents" : "Head of Family Verification"}
                  </div>
                  {verificationMethod === "documents" && (
                    <>
                      <div>
                        <strong>Identity Proof:</strong> [To be selected]
                      </div>
                      <div>
                        <strong>Address Proof:</strong> [To be selected]
                      </div>
                    </>
                  )}
                  {verificationMethod === "family-head" && (
                    <div>
                      <strong>POR Document:</strong> [To be selected]
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
    </AuthenticatedLayout>
  )
}
