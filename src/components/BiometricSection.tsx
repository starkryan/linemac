"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"

import { MorphoFingerprintCapture } from "@/components/morpho-fingerprint-capture"
import { AadhaarMantraCapture } from "@/components/mantra/AadhaarMantraCapture"

interface BiometricData {
  quality: number
  timestamp: string
  data: string
}

interface BiometricSectionProps {
  onFingerprintCapture?: (type: 'left' | 'right' | 'thumbs', data: BiometricData) => void
  onIrisCapture?: (type: 'left' | 'right', data: BiometricData) => void
  mode?: 'fingerprints' | 'iris'
  excludeThumbs?: boolean
  customTitles?: {
    left?: string
    right?: string
    thumbs?: string
  }
  simplifiedMode?: boolean
  simplifiedTitle?: string
  deviceType?: 'morpho' | 'mantra' | 'both'
}

export default function BiometricSection({ onFingerprintCapture, onIrisCapture, mode = 'fingerprints', excludeThumbs = false, customTitles, simplifiedMode = false, simplifiedTitle, deviceType = 'both' }: BiometricSectionProps) {
  const [activeCapture, setActiveCapture] = useState<string | null>(null)
  const [biometricData, setBiometricData] = useState<Record<string, BiometricData>>({})
  const [showRDCapture, setShowRDCapture] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<'morpho' | 'mantra'>('mantra')

  const allFingerprintTypes = [
    {
      id: 'left-hand',
      title: customTitles?.left || 'Left Hand',
      subtitle: '',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'left' as const
    },
    {
      id: 'right-hand',
      title: customTitles?.right || 'Right Hand',
      subtitle: '',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'right' as const
    },
    {
      id: 'both-thumbs',
      title: customTitles?.thumbs || 'Both Thumbs',
      subtitle: '',
      bgColor: 'bg-blue-100',
      type: 'fingerprint' as const,
      subtype: 'thumbs' as const
    }
  ]

  const fingerprintTypes = excludeThumbs
    ? allFingerprintTypes.filter(type => type.subtype !== 'thumbs')
    : allFingerprintTypes

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

  // For simplified mode, create a single biometric type
  const simplifiedBiometricType = simplifiedMode ? [{
    id: 'simplified',
    title: simplifiedTitle || 'Capture',
    subtitle: '',
    bgColor: 'bg-blue-100',
    type: 'fingerprint' as const,
    subtype: 'left' as const
  }] : []

  const displayTypes = simplifiedMode ? simplifiedBiometricType : biometricTypes

  const handleCapture = (biometricType: typeof displayTypes[0]) => {
    if (biometricType.type === 'fingerprint') {
      // Directly trigger RD capture without showing intermediate interface
      setActiveCapture(biometricType.id)
      // Set showRDCapture to the same biometric type to trigger immediate capture
      setShowRDCapture(biometricType.id)
    } else {
      // For iris or fallback to simulation
      const newData: BiometricData = {
        quality: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date().toISOString(),
        data: `simulated_${biometricType.type}_${biometricType.subtype}_${Date.now()}`
      }

      setBiometricData(prev => ({
        ...prev,
        [biometricType.id]: newData
      }))

      if (biometricType.type === 'iris' && onIrisCapture) {
        onIrisCapture(biometricType.subtype, newData)
      }

      setActiveCapture(null)
    }
  }

  const handleRDCapture = (type: 'left' | 'right' | 'thumbs', rdData: any) => {
    const biometricType = fingerprintTypes.find(ft => ft.subtype === type)
    if (!biometricType) return

    const newData: BiometricData = {
      quality: 95, // High quality for real device captures
      timestamp: new Date().toISOString(),
      data: rdData.pid || `rd_${type}_${Date.now()}`
    }

    setBiometricData(prev => ({
      ...prev,
      [biometricType.id]: newData
    }))

    if (onFingerprintCapture) {
      onFingerprintCapture(type, newData)
    }

    setShowRDCapture(null)
    setActiveCapture(null)
  }

  const handleMorphoCapture = (type: 'left' | 'right' | 'thumbs', morphoData: any) => {
    const biometricType = fingerprintTypes.find(ft => ft.subtype === type)
    if (!biometricType) return

    const newData: BiometricData = {
      quality: morphoData.score || 95,
      timestamp: new Date().toISOString(),
      data: morphoData.pid || `morpho_${type}_${Date.now()}`
    }

    setBiometricData(prev => ({
      ...prev,
      [biometricType.id]: newData
    }))

    if (onFingerprintCapture) {
      onFingerprintCapture(type, newData)
    }

    setShowRDCapture(null)
    setActiveCapture(null)
  }

  const handleMantraCapture = (type: 'left' | 'right' | 'thumbs', mantraData: any) => {
    const biometricType = fingerprintTypes.find(ft => ft.subtype === type)
    if (!biometricType) return

    const newData: BiometricData = {
      quality: mantraData.qScore || mantraData.score || 95,
      timestamp: mantraData.timestamp || new Date().toISOString(),
      data: mantraData.data || mantraData.pid || `mantra_${type}_${Date.now()}`
    }

    setBiometricData(prev => ({
      ...prev,
      [biometricType.id]: newData
    }))

    if (onFingerprintCapture) {
      onFingerprintCapture(type, newData)
    }

    setShowRDCapture(null)
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
      {/* Device selection - Hidden from UI but functionality preserved */}
      {/* Device selection UI removed as requested, but functionality remains active */}

      {/* Biometric capture interface */}
      <div className={simplifiedMode ? "grid grid-cols-1 gap-6" : "grid grid-cols-2 lg:grid-cols-3 gap-6"}>
        {displayTypes.map((biometricType) => {
          const capturedData = biometricData[biometricType.id]
          const isActive = activeCapture === biometricType.id

          return (
            <div key={biometricType.id} className="bg-white border border-gray-300 rounded">
              {/* Header */}
              <div className={`${biometricType.bgColor} px-4 py-2 flex items-center`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => isActive ? setActiveCapture(null) : handleCapture(biometricType)}
                    title={isActive ? "Stop Capture" : "Start Capture"}
                  >
                    {isActive ? (
                      <img
                        src="/arrow-pause.png"
                        alt="Stop Capture"
                        className="w-5 h-5"
                      />
                    ) : (
                      <AadhaarIcon />
                    )}
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
              </div>

              {/* Content */}
              <div className="p-4">
                {isActive && biometricType.type === 'fingerprint' ? (
                  /* Device-specific capture state */
                  <div className="space-y-4">
                    <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center relative">
                      <div className="text-center text-white w-full">
                        {deviceType === 'morpho' ? (
                          <MorphoFingerprintCapture
                            captureType={biometricType.subtype}
                            title={biometricType.title}
                            onCaptureComplete={(data) => handleMorphoCapture(biometricType.subtype, data)}
                          />
                        ) : deviceType === 'mantra' ? (
                          <AadhaarMantraCapture
                            captureType={biometricType.subtype}
                            title={biometricType.title}
                            onCaptureComplete={(data) => handleMantraCapture(biometricType.subtype, data)}
                            autoStart={true}
                          />
                        ) : selectedDevice === 'morpho' ? (
                          <MorphoFingerprintCapture
                            captureType={biometricType.subtype}
                            title={biometricType.title}
                            onCaptureComplete={(data) => handleMorphoCapture(biometricType.subtype, data)}
                          />
                        ) : selectedDevice === 'mantra' ? (
                          <AadhaarMantraCapture
                            captureType={biometricType.subtype}
                            title={biometricType.title}
                            onCaptureComplete={(data) => handleMantraCapture(biometricType.subtype, data)}
                            autoStart={true}
                          />
                        ) : null}
                      </div>
                    </div>
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Score:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                          style={{ width: `${capturedData?.quality || 0}%` }}
                        >
                          {capturedData?.quality || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isActive ? (
                  /* Active capture state */
                  <div className="space-y-4">
          
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Score:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                          style={{ width: `${capturedData?.quality || 0}%` }}
                        >
                          {capturedData?.quality || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : capturedData ? (
                  /* Show captured data with tick image */
                  <div className="space-y-4">
                    <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center text-white">
                        {/* Show tick image for successful capture */}
                        <img
                          src="/tick.png"
                          alt="Fingerprint Captured"
                          className="w-16 h-16 mx-auto mb-4"
                        />
                        <p className="text-lg font-medium mb-2">{biometricType.title}</p>
                   
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCapture(biometricType)}
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
                  /* Empty state - just black screen */
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
