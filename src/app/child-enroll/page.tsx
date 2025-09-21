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
import { Baby, Camera, Fingerprint, FileText, Users } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function ChildEnrollPage() {
  const [activeStep, setActiveStep] = useState("parent")
  const [hasParentAadhaar, setHasParentAadhaar] = useState("yes")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isDOBVerified, setIsDOBVerified] = useState(false)

  const steps = [
    { id: "parent", label: "Parent Details", icon: Users },
    { id: "child", label: "Child Details", icon: Baby },
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
      <div className="min-h-screen bg-gray-100">
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
        {activeStep === "parent" && (
          <>
            {/* Parent Verification Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Parent/Guardian Verification</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Parent has Aadhaar</span>
                      <span className="text-red-600 font-bold text-base">✱</span>
                      <span className="text-gray-400 text-xs">⊙</span>
                    </div>
                    <RadioGroup value={hasParentAadhaar} onValueChange={setHasParentAadhaar} className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" className="border-gray-400" />
                        <Label htmlFor="yes" className="text-sm text-gray-700">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" className="border-gray-400" />
                        <Label htmlFor="no" className="text-sm text-gray-700">No</Label>
                      </div>
                    </RadioGroup>
                    <div className="ml-auto text-sm text-gray-700">
                      अभिभावक के पास आधार <span className="text-red-600 font-bold text-base">✱</span> हाँ/नहीं
                    </div>
                  </div>

                  {hasParentAadhaar === "yes" ? (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            Parent's Aadhaar Number <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" placeholder="Enter 12-digit Aadhaar number" />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            मोबाइल नंबर <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" placeholder="मोबाइल नंबर दर्ज करें" />
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm text-blue-700">
                          OTP will be sent to the registered mobile number for verification. Please ensure the mobile number is linked with your Aadhaar.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            Parent's Full Name <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" placeholder="Enter parent's name" />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            अभिभावक का पूरा नाम <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" placeholder="अभिभावक का नाम दर्ज करें" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            Parent's DOB <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" type="date" />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">
                            जन्म तिथि <span className="text-red-600 font-bold text-base">✱</span>
                          </Label>
                          <Input className="bg-white border-gray-400 h-8" type="date" />
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Alternative Documents Required:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Parent's valid ID proof (Passport, PAN, Voter ID)</li>
                          <li>• Parent's address proof</li>
                          <li>• Child's birth certificate</li>
                          <li>• Parent's photograph</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "child" && (
          <>
            {/* Child Details Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Child Information</h2>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-4">
                  {/* Child Name */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Child's Full Name <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="Enter child's full name" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        बच्चे का पूरा नाम <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="बच्चे का पूरा नाम दर्ज करें" />
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

                  {/* Date of Birth with Verification */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block flex items-center gap-1">
                        Date of Birth <span className="text-red-600 font-bold text-base">✱</span>
                        <span className="text-gray-400 text-xs">⊙</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input className="bg-white border-gray-400 h-8" type="date" />
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
                        जन्म तिथि <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" type="date" />
                    </div>
                  </div>

                  {/* Place of Birth */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Place of Birth <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="Hospital/City/Village" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        जन्म स्थान <span className="text-red-600 font-bold text-base">✱</span>
                      </Label>
                      <Input className="bg-white border-gray-400 h-8" placeholder="अस्पताल/शहर/गांव" />
                    </div>
                  </div>

                  {/* Address (Same as Parent) */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="same-address" defaultChecked className="border-gray-400" />
                      <Label htmlFor="same-address" className="text-sm text-gray-700">
                        Address same as parent/guardian
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm text-gray-700 mb-2 block">
                          Address <span className="text-red-600 font-bold text-base">✱</span>
                        </Label>
                        <Input className="bg-white border-gray-400 h-8" placeholder="Complete address" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700 mb-2 block">
                          पता <span className="text-red-600 font-bold text-base">✱</span>
                        </Label>
                        <Input className="bg-white border-gray-400 h-8" placeholder="पूरा पता" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "photo" && (
          <>
            {/* Child Photo Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Child Photograph</h2>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Camera Preview</Label>
                    <div className="bg-black w-full h-80 mb-4 border border-gray-400 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <Button className="bg-blue-600 text-white px-6 w-full">Capture Photo</Button>
                      <Button variant="outline" className="bg-white border-gray-400 px-6 w-full">
                        Retake
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700 mb-2 block">Child Photo Guidelines</Label>
                    <div className="bg-gray-50 p-4 text-sm space-y-2">
                      <div><strong>Important:</strong></div>
                      <div>• Parent/Guardian must be present</div>
                      <div>• Child's face should be clearly visible</div>
                      <div>• Plain or light background preferred</div>
                      <div>• No toys or distractions in frame</div>
                      <div>• Child should be looking at camera</div>
                      <div className="mt-4"><strong>Tips for better photo:</strong></div>
                      <div>• Make child comfortable first</div>
                      <div>• Use toys to get attention</div>
                      <div>• Take multiple shots for best result</div>
                      <div>• Ensure good lighting on face</div>
                      <div>• Avoid shadows on face</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeStep === "biometric" && (
          <>
            {/* Biometric Data Section */}
            <div className="mb-6">
              <div className="bg-gray-200 px-4 py-2 border border-gray-300">
                <h2 className="text-base font-semibold text-gray-800">Biometric Data</h2>
              </div>
              <div className="bg-white p-4">
                <div className="bg-blue-50 border border-blue-200 p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Note for Child Biometrics</h3>
                  <p className="text-sm text-blue-700">
                    For children below 5 years, only photograph is mandatory. Biometrics will be updated when the child turns 5 and 15 years of age.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Left Hand (Optional)</Label>
                    <div className="bg-yellow-100 border border-yellow-400 p-3 mb-2">
                      <Fingerprint className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <div className="text-sm text-yellow-700">Optional for children</div>
                    </div>
                    <Button variant="outline" className="bg-white border-gray-400 px-4 text-sm">
                      Skip for Now
                    </Button>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm text-gray-700 mb-2 block">Right Hand (Optional)</Label>
                    <div className="bg-yellow-100 border border-yellow-400 p-3 mb-2">
                      <Fingerprint className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <div className="text-sm text-yellow-700">Optional for children</div>
                    </div>
                    <Button variant="outline" className="bg-white border-gray-400 px-4 text-sm">
                      Skip for Now
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Biometric Update Schedule:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Age 5-15 years: Update biometrics (mandatory)</li>
                    <li>• Age 15+ years: Final biometric update (mandatory)</li>
                    <li>• You will receive SMS reminders for updates</li>
                  </ul>
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

                {/* Parent Information Review */}
                <div className="mb-6">
                  <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Parent/Guardian Information</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-400 h-8 px-3 text-xs"
                      onClick={() => setActiveStep("parent")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="mb-2">
                          <strong>Has Aadhaar:</strong> {hasParentAadhaar === "yes" ? "Yes" : "No"}
                        </div>
                        <div className="mb-2">
                          <strong>{hasParentAadhaar === "yes" ? "Aadhaar Number:" : "Name:"}</strong> [To be filled]
                        </div>
                        <div className="mb-2">
                          <strong>Mobile:</strong> [To be filled]
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <strong>आधार उपलब्ध:</strong> {hasParentAadhaar === "yes" ? "हाँ" : "नहीं"}
                        </div>
                        <div className="mb-2">
                          <strong>{hasParentAadhaar === "yes" ? "आधार नंबर:" : "नाम:"}</strong> [भरा जाना है]
                        </div>
                        <div className="mb-2">
                          <strong>मोबाइल:</strong> [भरा जाना है]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Information Review */}
                <div className="mb-6">
                  <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Child Information</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-400 h-8 px-3 text-xs"
                      onClick={() => setActiveStep("child")}
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
                          <strong>Date of Birth:</strong> [To be filled] {isDOBVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                        </div>
                        <div className="mb-2">
                          <strong>Place of Birth:</strong> [To be filled]
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
                          <strong>जन्म स्थान:</strong> [भरा जाना है]
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
                        <strong>Requirements:</strong> Parent/Guardian must be present during photo capture
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
                        <strong>Status:</strong> Optional for children below 5 years
                      </div>
                      <div>
                        <strong>Left Hand:</strong> Not captured (Optional)
                      </div>
                      <div>
                        <strong>Right Hand:</strong> Not captured (Optional)
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
            disabled={activeStep === "parent"}
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
      </div>
    </AuthenticatedLayout>
  )
}