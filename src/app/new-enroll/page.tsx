"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import { UserPlus, Camera, Fingerprint, FileText } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function NewEnrollPage() {
  const [activeStep, setActiveStep] = useState("resident")
  const [residentType, setResidentType] = useState("adult")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const steps = [
    { id: "resident", label: "Resident Type", icon: UserPlus },
    { id: "demographics", label: "Demographics", icon: FileText },
    { id: "photo", label: "Photograph", icon: Camera },
    { id: "biometric", label: "Biometric", icon: Fingerprint },
    { id: "review", label: "Review", icon: FileText },
  ]

  const handleStepClick = (stepId: string) => {
    setActiveStep(stepId)
  }

  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === activeStep)
    if (currentIndex < steps.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps([...completedSteps, activeStep])
      }
      setActiveStep(steps[currentIndex + 1].id)
    }
  }

  const getStepIcon = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      return <Image src="/green-tick-icon.png" alt="Completed" width={20} height={20} className="w-5 h-5" />
    }
    return <Image src="/red-square-icon.png" alt="Pending" width={20} height={20} className="w-5 h-5" />
  }

  const getStepStyling = (stepId: string) => {
    if (stepId === activeStep) {
      return "bg-orange-500 text-white" // Orange background for active
    }
    return "bg-gray-700 text-white" // Gray background for all others
  }

  return (
    <AuthenticatedLayout>
      {/* Navigation Tabs */}
      <div className="bg-gray-800 flex">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`px-4 py-3 text-sm font-medium border-l border-gray-600 cursor-pointer flex items-center gap-3 ${getStepStyling(step.id)} hover:opacity-90`}
            onClick={() => handleStepClick(step.id)}
          >
            {getStepIcon(step.id)}
            {step.label}
          </div>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {activeStep === "resident" && (
          <>
            {/* Resident Type Selection */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Select Resident Type</h2>
              </div>
              <div className="bg-white p-4">
                <RadioGroup value={residentType} onValueChange={setResidentType} className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adult" id="adult" className="border-gray-400" />
                      <Label htmlFor="adult" className="text-sm text-gray-700">
                        Adult (18 years and above)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="child" id="child" className="border-gray-400" />
                      <Label htmlFor="child" className="text-sm text-gray-700">
                        Child (5 to 17 years)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="infant" id="infant" className="border-gray-400" />
                      <Label htmlFor="infant" className="text-sm text-gray-700">
                        Infant (0 to 4 years)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nri" id="nri" className="border-gray-400" />
                      <Label htmlFor="nri" className="text-sm text-gray-700">
                        Non-Resident Indian (NRI)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-semibold text-blue-800 mb-2">Documents Required:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Proof of Identity (POI)</li>
                    <li>• Proof of Address (POA)</li>
                    <li>• Proof of Date of Birth (DOB)</li>
                    {residentType === "child" && <li>• Parent/Guardian Aadhaar</li>}
                    {residentType === "infant" && <li>• Birth Certificate</li>}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "demographics" && (
          <>
            {/* Demographics Form */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Demographic Information</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Full Name <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="Enter full name" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="पूरा नाम दर्ज करें" />
                    </div>
                  </div>

                  {/* Gender and DOB */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Gender <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="Select gender" />
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
                        Date of Birth <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" type="date" />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Address <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="House/Street/Area" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        पता <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="घर/सड़क/क्षेत्र" />
                    </div>
                  </div>

                  {/* State and Pin Code */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        State <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-white border-gray-400 h-8">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                    <SelectItem value="ap">Andhra Pradesh</SelectItem>
<SelectItem value="ar">Arunachal Pradesh</SelectItem>
<SelectItem value="as">Assam</SelectItem>
<SelectItem value="br">Bihar</SelectItem>
<SelectItem value="ct">Chhattisgarh</SelectItem>
<SelectItem value="ga">Goa</SelectItem>
<SelectItem value="gj">Gujarat</SelectItem>
<SelectItem value="hr">Haryana</SelectItem>
<SelectItem value="hp">Himachal Pradesh</SelectItem>
<SelectItem value="jh">Jharkhand</SelectItem>
<SelectItem value="ka">Karnataka</SelectItem>
<SelectItem value="kl">Kerala</SelectItem>
<SelectItem value="mp">Madhya Pradesh</SelectItem>
<SelectItem value="mh">Maharashtra</SelectItem>
<SelectItem value="mn">Manipur</SelectItem>
<SelectItem value="ml">Meghalaya</SelectItem>
<SelectItem value="mz">Mizoram</SelectItem>
<SelectItem value="nl">Nagaland</SelectItem>
<SelectItem value="od">Odisha</SelectItem>
<SelectItem value="pb">Punjab</SelectItem>
<SelectItem value="rj">Rajasthan</SelectItem>
<SelectItem value="sk">Sikkim</SelectItem>
<SelectItem value="tn">Tamil Nadu</SelectItem>
<SelectItem value="tg">Telangana</SelectItem>
<SelectItem value="tr">Tripura</SelectItem>
<SelectItem value="up">Uttar Pradesh</SelectItem>
<SelectItem value="uk">Uttarakhand</SelectItem>
<SelectItem value="wb">West Bengal</SelectItem>
<SelectItem value="an">Andaman and Nicobar Islands</SelectItem>
<SelectItem value="ch">Chandigarh</SelectItem>
<SelectItem value="dn">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
<SelectItem value="dl">Delhi</SelectItem>
<SelectItem value="jk">Jammu and Kashmir</SelectItem>
<SelectItem value="la">Ladakh</SelectItem>
<SelectItem value="ld">Lakshadweep</SelectItem>
<SelectItem value="py">Puducherry</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Pin Code <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="Enter pin code" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "photo" && (
          <>
            {/* Photo Capture */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Photograph Capture</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Camera Preview</Label>
                    <div className="bg-black w-full h-96 mb-4 border border-gray-400 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-500" />
                    </div>
                    <Button className="bg-blue-600 text-white px-6">Capture Photo</Button>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Photo Guidelines</Label>
                    <div className="bg-gray-50 p-4 text-sm space-y-2">
                      <div><strong>Requirements:</strong></div>
                      <div>• Face should be clearly visible</div>
                      <div>• Plain background required</div>
                      <div>• No glasses or accessories</div>
                      <div>• Neutral expression</div>
                      <div>• Both eyes open</div>
                      <div className="mt-4"><strong>Quality Check:</strong></div>
                      <div>• Good lighting conditions</div>
                      <div>• High resolution image</div>
                      <div>• File size: 5KB - 100KB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "biometric" && (
          <>
            {/* Biometric Capture */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Biometric Data Capture</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Left Hand</Label>
                    <div className="bg-green-100 border border-green-400 p-3 mb-2">
                      <Fingerprint className="w-16 h-16 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-green-700">Ready to scan</div>
                    </div>
                    <Button className="bg-blue-600 text-white px-4 text-sm">Scan Left Hand</Button>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Right Hand</Label>
                    <div className="bg-green-100 border border-green-400 p-3 mb-2">
                      <Fingerprint className="w-16 h-16 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-green-700">Ready to scan</div>
                    </div>
                    <Button className="bg-blue-600 text-white px-4 text-sm">Scan Right Hand</Button>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Both Thumbs</Label>
                    <div className="bg-green-100 border border-green-400 p-3 mb-2">
                      <Fingerprint className="w-16 h-16 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-green-700">Ready to scan</div>
                    </div>
                    <Button className="bg-blue-600 text-white px-4 text-sm">Scan Thumbs</Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "review" && (
          <>
            {/* Review Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Application Review Summary</h2>
              </div>
              <div className="bg-white p-4">
                <div className="text-sm text-gray-600 mb-4">
                  Please review all the information entered before final submission. Click on any section to edit.
                </div>

                {/* Resident Type Review */}
                <div className="mb-6">
                  <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Resident Type</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-400 h-8 px-3 text-xs"
                      onClick={() => setActiveStep("resident")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="mb-2">
                          <strong>Resident Type:</strong> {residentType === "adult" ? "Adult (18+)" : residentType === "child" ? "Child (5-17)" : residentType === "infant" ? "Infant (0-4)" : "NRI"}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <strong>निवासी प्रकार:</strong> {residentType === "adult" ? "वयस्क (18+)" : residentType === "child" ? "बच्चा (5-17)" : residentType === "infant" ? "शिशु (0-4)" : "एनआरआई"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demographics Review */}
                <div className="mb-6">
                  <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Demographic Information</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-400 h-8 px-3 text-xs"
                      onClick={() => setActiveStep("demographics")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="mb-2">
                          <strong>Full Name:</strong> [To be filled]
                        </div>
                        <div className="mb-2">
                          <strong>Gender:</strong> [To be selected]
                        </div>
                        <div className="mb-2">
                          <strong>Date of Birth:</strong> [To be filled]
                        </div>
                        <div className="mb-2">
                          <strong>Address:</strong> [To be filled]
                        </div>
                        <div className="mb-2">
                          <strong>State:</strong> [To be selected]
                        </div>
                        <div className="mb-2">
                          <strong>Pin Code:</strong> [To be filled]
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <strong>पूरा नाम:</strong> [भरा जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>लिंग:</strong> [चुना जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>जन्म तिथि:</strong> [भरा जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>पता:</strong> [भरा जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>राज्य:</strong> [चुना जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>पिन कोड:</strong> [भरा जाना है]
                        </div>
                      </div>
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
                      onClick={() => setActiveStep("photo")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-4">
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Status:</strong> Not captured
                      </div>
                      <div>
                        <strong>Requirements:</strong> Clear face photo with plain background
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biometric Review */}
                <div className="mb-6">
                  <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Biometric Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-400 h-8 px-3 text-xs"
                      onClick={() => setActiveStep("biometric")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-4">
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Left Hand:</strong> Not captured
                      </div>
                      <div>
                        <strong>Right Hand:</strong> Not captured
                      </div>
                      <div>
                        <strong>Thumbs:</strong> Not captured
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
                      By clicking "Submit Application", you confirm that all the information provided is accurate and complete.
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <input type="checkbox" id="confirm" className="border-gray-400" />
                      <Label htmlFor="confirm" className="text-sm text-gray-700">
                        I confirm that all information provided is accurate and I understand that providing false information is a punishable offense.
                      </Label>
                    </div>
                    <Button className="bg-green-600 text-white px-8 py-2">Submit Application</Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="bg-white border-gray-400 px-6 flex items-center gap-2"
            onClick={() => {
              const currentIndex = steps.findIndex((step) => step.id === activeStep)
              if (currentIndex > 0) {
                const newStep = steps[currentIndex - 1].id
                setActiveStep(newStep)
                setCompletedSteps(prev => {
                  const newCompleted = prev.filter(step => step !== newStep)
                  return newCompleted
                })
              }
            }}
            disabled={activeStep === "resident"}
          >
            <AadhaarIcon mirrored />
            Previous
          </Button>
          {activeStep !== "review" && (
            <Button className="bg-blue-600 text-white px-6 flex items-center gap-2" onClick={handleNext}>
              Next
              <AadhaarIcon />
            </Button>
          )}
          {activeStep === "review" && (
            <Button className="bg-green-600 text-white px-6 flex items-center gap-2">
              Submit Application
              <AadhaarIcon />
            </Button>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
