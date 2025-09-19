"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function BiometricEnrollmentPage() {
  const [enrollmentId, setEnrollmentId] = useState("")
  const [aadhaarNo, setAadhaarNo] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [residentFinger, setResidentFinger] = useState("Place Any Finger")
  const [operatorFinger, setOperatorFinger] = useState("Place Any Finger")

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-600 text-sm">You have</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
              <span className="text-gray-700 font-medium">EDENOID</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              <span className="text-gray-400">Demographic Details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section - Input Fields */}
            <div className="space-y-6">
              {/* Enrollment ID */}
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
                <Label className="text-gray-700 font-medium min-w-[100px]">Enrolment ID</Label>
                <div className="flex gap-2 flex-1">
                  <Input
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="0000-00000-00000"
                    className="bg-white border-gray-300 text-sm"
                  />
                  <span className="text-gray-500">:</span>
                  <Input
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder="dd/MM/yyyy:hh:mm:ss"
                    className="bg-white border-gray-300 text-sm flex-1"
                  />
                </div>
              </div>

              {/* Aadhaar Number */}
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
                <Label className="text-gray-700 font-medium min-w-[100px]">Aadhaar No.</Label>
                <Input
                  value={aadhaarNo}
                  onChange={(e) => setAadhaarNo(e.target.value)}
                  placeholder="0000-0000-0000"
                  className="bg-white border-gray-300 text-sm flex-1"
                />
              </div>
            </div>

            {/* Right Section - Capture Areas */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capture Resident */}
              <div className="border border-gray-300 rounded-lg bg-white p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-0 h-0 border-l-[8px] border-l-green-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                  <span className="font-medium text-gray-700">Capture Resident</span>
                  <span className="ml-auto text-gray-600 text-sm">Place Any Finger</span>
                </div>

                {/* Black capture area */}
                <div className="bg-black h-64 rounded mb-4 flex items-center justify-center"></div>

                <div className="flex items-center gap-2">
                  <Label className="text-gray-600 text-sm">Score</Label>
                  <div className="flex-1 bg-gray-200 h-6 rounded border border-gray-300 flex items-center px-2">
                    <span className="text-gray-600 text-sm">0%</span>
                  </div>
                </div>
              </div>

              {/* Capture Operator */}
              <div className="border border-gray-300 rounded-lg bg-white p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-0 h-0 border-l-[8px] border-l-green-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                  <span className="font-medium text-gray-700">Capture Operator</span>
                  <span className="ml-auto text-gray-600 text-sm">Place Any Finger</span>
                </div>

                {/* Black capture area */}
                <div className="bg-black h-64 rounded mb-4 flex items-center justify-center"></div>

                <div className="flex items-center gap-2">
                  <Label className="text-gray-600 text-sm">Score</Label>
                  <div className="flex-1 bg-gray-200 h-6 rounded border border-gray-300 flex items-center px-2">
                    <span className="text-gray-600 text-sm">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Find Aadhaar Button */}
          <div className="flex justify-end mt-8">
            <Button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 border border-gray-400">
              Find Aadhaar
            </Button>
          </div>

          {/* Bottom watermark */}
          <div className="fixed bottom-4 right-4 text-gray-400 text-sm">Activate Windows</div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}