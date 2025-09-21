"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"
import BiometricSection from "@/components/BiometricSection"

export default function BiometricEnrollmentPage() {
  const [activeStep, setActiveStep] = useState<'edenoid' | 'demographic'>('edenoid')
  const [enrollmentId, setEnrollmentId] = useState("")
  const [aadhaarNo, setAadhaarNo] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [residentFinger, setResidentFinger] = useState("Place Any Finger")
  const [operatorFinger, setOperatorFinger] = useState("Place Any Finger")
  const [selectedField, setSelectedField] = useState<'enrollment' | 'aadhaar'>('enrollment')

  const handleResidentCapture = (type: 'left' | 'right' | 'thumbs', data: any) => {
    setResidentFinger(`Captured ${type} hand - Quality: ${data.quality || 95}%`)
  }

  const handleOperatorCapture = (type: 'left' | 'right' | 'thumbs', data: any) => {
    setOperatorFinger(`Captured ${type} hand - Quality: ${data.quality || 95}%`)
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-600 text-sm">You have</span>
            <RadioGroup value={activeStep} onValueChange={(value) => setActiveStep(value as 'edenoid' | 'demographic')} className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edenoid" id="edenoid" className="border-gray-400" />
                <Label htmlFor="edenoid" className="text-gray-700 font-medium cursor-pointer">EDENOID</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="demographic" id="demographic" className="border-gray-300" />
                <Label htmlFor="demographic" className="text-gray-700 font-medium cursor-pointer">Demographic Details</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section - Input Fields */}
            <div className="space-y-6">
              {/* Field Selection Radio Group */}
              <RadioGroup value={selectedField} onValueChange={(value) => setSelectedField(value as 'enrollment' | 'aadhaar')} className="space-y-4">
                {/* Enrollment ID Option */}
                <div className="flex items-center gap-4 p-4  transition-colors">
                  <RadioGroupItem value="enrollment" id="enrollment" className="border-gray-400" />
                  <div className="flex-1">
                    <Label htmlFor="enrollment" className="text-gray-700 font-medium cursor-pointer">
                      Enrolment ID
                    </Label>
                    <div className="mt-2 flex gap-2 items-center">
                      <Input
                        id="enrollmentId"
                        name="enrollmentId"
                        type="text"
                        value={enrollmentId}
                        onChange={(e) => setEnrollmentId(e.target.value)}
                        placeholder="0000-00000-00000"
                        autoComplete="off"
                        tabIndex={0}
                        aria-label="Enrolment ID"
                        className="bg-white border-gray-300 text-sm flex-none w-56 text-gray-900 placeholder-gray-400 cursor-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-gray-500 select-none">:</span>
                      <Input
                        id="dateTime"
                        name="dateTime"
                        type="text"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        placeholder="dd/MM/yyyy:hh:mm:ss"
                        autoComplete="off"
                        tabIndex={0}
                        aria-label="Date and time"
                        className="bg-white border-gray-300 text-sm flex-1 text-gray-900 placeholder-gray-400 cursor-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Aadhaar Number Option */}
                <div className="flex items-center gap-4 p-4 ">
                  <RadioGroupItem value="aadhaar" id="aadhaar" className="border-gray-400" />
                  <div className="flex-1">
                    <Label htmlFor="aadhaar" className="text-gray-700 font-medium cursor-pointer">
                      Aadhaar No.
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="aadhaarNo"
                        name="aadhaarNo"
                        type="text"
                        value={aadhaarNo}
                        onChange={(e) => setAadhaarNo(e.target.value)}
                        placeholder="0000-0000-0000"
                        autoComplete="off"
                        tabIndex={0}
                        aria-label="Aadhaar number"
                        className="bg-white border-gray-300 text-sm w-full max-w-md text-gray-900 placeholder-gray-400 cursor-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Section - Capture Areas */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <BiometricSection
                onFingerprintCapture={handleResidentCapture}
                mode="fingerprints"
                simplifiedMode={true}
                simplifiedTitle="Capture Resident"
              />
              <BiometricSection
                onFingerprintCapture={handleOperatorCapture}
                mode="fingerprints"
                simplifiedMode={true}
                simplifiedTitle="Capture Operator"
              />
            </div>
          </div>

          {/* Find Aadhaar Button */}
          <div className="flex justify-end mt-8">
            <Button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 border border-gray-400">
              Find Aadhaar
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
