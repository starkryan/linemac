"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"

interface BiometricData {
  quality: number
  timestamp: string
  data: string
}

interface BiometricSectionProps {
  onFingerprintCapture?: (type: 'left' | 'right' | 'thumbs', data: BiometricData) => void
  onIrisCapture?: (type: 'left' | 'right', data: BiometricData) => void
  mode?: 'fingerprints' | 'iris'
}

export default function BiometricSection({ onFingerprintCapture, onIrisCapture, mode = 'fingerprints' }: BiometricSectionProps) {
  const [activeCapture, setActiveCapture] = useState<string | null>(null)
  const [biometricData, setBiometricData] = useState<Record<string, BiometricData>>({})

  const fingerprintTypes = [
    {
      id: 'left-hand',
      title: 'Left Hand',
      subtitle: 'Fingerprint Capture',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'left' as const
    },
    {
      id: 'right-hand',
      title: 'Right Hand',
      subtitle: 'Fingerprint Capture',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'right' as const
    },
    {
      id: 'both-thumbs',
      title: 'Both Thumbs',
      subtitle: 'Fingerprint Capture',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'thumbs' as const
    }
  ]

  const irisTypes = [
    {
      id: 'left-iris',
      title: 'Left Eye',
      subtitle: 'Iris Capture',
      bgColor: 'bg-blue-100',

      type: 'iris' as const,
      subtype: 'left' as const
    },
    {
      id: 'right-iris',
      title: 'Right Eye',
      subtitle: 'Iris Capture',
      bgColor: 'bg-blue-100',
      type: 'iris' as const,
      subtype: 'right' as const
    }
  ]

  const biometricTypes = mode === 'fingerprints' ? fingerprintTypes : irisTypes

  const handleCapture = (biometricType: typeof biometricTypes[0]) => {
    // Simulate capture process
    const newData: BiometricData = {
      quality: Math.floor(Math.random() * 30) + 70, // 70-99%
      timestamp: new Date().toISOString(),
      data: `simulated_${biometricType.type}_${biometricType.subtype}_${Date.now()}`
    }

    setBiometricData(prev => ({
      ...prev,
      [biometricType.id]: newData
    }))

    if (biometricType.type === 'fingerprint' && onFingerprintCapture) {
      onFingerprintCapture(biometricType.subtype, newData)
    } else if (biometricType.type === 'iris' && onIrisCapture) {
      onIrisCapture(biometricType.subtype, newData)
    }

    setActiveCapture(null)
  }

  const handleRemoveData = (id: string) => {
    setBiometricData(prev => {
      const newData = { ...prev }
      delete newData[id]
      return newData
    })
  }

  return (
    <div className="space-y-6">
      {/* Biometric capture interface */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {biometricTypes.map((biometricType) => {
          const capturedData = biometricData[biometricType.id]
          const isActive = activeCapture === biometricType.id

          return (
            <div key={biometricType.id} className="bg-white border border-gray-300 rounded">
              {/* Header */}
              <div className={`${biometricType.bgColor} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setActiveCapture(isActive ? null : biometricType.id)}
                    title={isActive ? "Stop Capture" : "Start Capture"}
                  >
                    <AadhaarIcon />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800 block">
                      {biometricType.title}
                    </span>
                    <span className="text-xs text-gray-600">
                      {biometricType.subtitle}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Score</span>
                  <Input
                    className="bg-white border-gray-400 h-6 w-16 text-center"
                    value={`${capturedData?.quality || 0}%`}
                    readOnly
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {isActive ? (
                  /* Active capture state */
                  <div className="space-y-4">
                    <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center relative">
                      <div className="text-center text-white">
                     
                        <p className="text-lg font-medium mb-2">Capturing {biometricType.title}</p>
                        <p className="text-sm opacity-75">Please position {biometricType.type === 'fingerprint' ? 'fingers' : 'eye'} properly</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                ) : capturedData ? (
                  /* Show captured data */
                  <div className="space-y-4">
                    <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center text-white">
                    
                        <p className="text-lg font-medium mb-2">{biometricType.title}</p>
                        <p className="text-sm opacity-75">Quality: {capturedData.quality}%</p>
                        <p className="text-xs opacity-50 mt-2">
                          {new Date(capturedData.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setActiveCapture(biometricType.id)}
                        variant="outline"
                        className="border-gray-400 flex-1"
                      >
                         Recapture
                      </Button>
                      <Button
                        onClick={() => handleRemoveData(biometricType.id)}
                        variant="outline"
                        className="border-red-400 text-red-600 hover:bg-red-50 flex-1"
                      >
                         Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="space-y-4">
                    <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center">
                     
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}