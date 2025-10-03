"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import CameraComponent from "@/components/CameraComponent"
import Image from "next/image"

interface PhotographSectionProps {
  onPhotoCountChange?: (mainPhotoCount: number, exceptionPhotoCount: number) => void
}

export default function PhotographSection({ onPhotoCountChange }: PhotographSectionProps) {
  const [mainCameraActive, setMainCameraActive] = useState(false)
  const [exceptionCameraActive, setExceptionCameraActive] = useState(false)
  const [mainPhotos, setMainPhotos] = useState<string[]>([])
  const [exceptionPhotos, setExceptionPhotos] = useState<string[]>([])
  const [mainPhotoScore, setMainPhotoScore] = useState(0)
  const [exceptionPhotoScore, setExceptionPhotoScore] = useState(0)
  const mainPhotoIndexRef = useRef(0)
  const exceptionPhotoIndexRef = useRef(0)
  const mainCameraRef = useRef<{ startCamera: () => void }>(null)
  const exceptionCameraRef = useRef<{ startCamera: () => void }>(null)

  const handleMainPhotoCapture = (photoData: string) => {
    // Add to main photos array
    setMainPhotos(prev => [...prev, photoData])
    mainPhotoIndexRef.current++

    // Simulate quality score (in real app, this would be calculated)
    const score = Math.floor(Math.random() * 40) + 60 // 60-99%
    setMainPhotoScore(score)

    if (onPhotoCountChange) {
      onPhotoCountChange(4 - mainPhotoIndexRef.current, 4 - exceptionPhotoIndexRef.current)
    }
  }

  const handleExceptionPhotoCapture = (photoData: string) => {
    // Add to exception photos array
    setExceptionPhotos(prev => [...prev, photoData])
    exceptionPhotoIndexRef.current++

    // Simulate quality score
    const score = Math.floor(Math.random() * 40) + 60 // 60-99%
    setExceptionPhotoScore(score)

    if (onPhotoCountChange) {
      onPhotoCountChange(4 - mainPhotoIndexRef.current, 4 - exceptionPhotoIndexRef.current)
    }
  }

  const removeMainPhoto = (index: number) => {
    setMainPhotos(prev => prev.filter((_, i) => i !== index))
    if (mainPhotos.length <= 1) {
      setMainPhotoScore(0)
    }
    mainPhotoIndexRef.current = Math.max(0, mainPhotoIndexRef.current - 1)
    if (onPhotoCountChange) {
      onPhotoCountChange(4 - mainPhotoIndexRef.current, 4 - exceptionPhotoIndexRef.current)
    }
  }

  const removeExceptionPhoto = (index: number) => {
    setExceptionPhotos(prev => prev.filter((_, i) => i !== index))
    if (exceptionPhotos.length <= 1) {
      setExceptionPhotoScore(0)
    }
    exceptionPhotoIndexRef.current = Math.max(0, exceptionPhotoIndexRef.current - 1)
    if (onPhotoCountChange) {
      onPhotoCountChange(4 - mainPhotoIndexRef.current, 4 - exceptionPhotoIndexRef.current)
    }
  }

  const restartMainCamera = () => {
    if (mainCameraActive) {
      setMainCameraActive(false)
      setTimeout(() => setMainCameraActive(true), 100)
    }
  }

  const restartExceptionCamera = () => {
    if (exceptionCameraActive) {
      setExceptionCameraActive(false)
      setTimeout(() => setExceptionCameraActive(true), 100)
    }
  }

  // Effect to start camera when component becomes active
  useEffect(() => {
    if (mainCameraActive && mainCameraRef.current) {
      console.log('PhotographSection: Starting main camera')
      // Small delay to ensure CameraComponent is fully mounted
      const timer = setTimeout(() => {
        mainCameraRef.current?.startCamera()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [mainCameraActive])

  useEffect(() => {
    if (exceptionCameraActive && exceptionCameraRef.current) {
      console.log('PhotographSection: Starting exception camera')
      // Small delay to ensure CameraComponent is fully mounted
      const timer = setTimeout(() => {
        exceptionCameraRef.current?.startCamera()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [exceptionCameraActive])

  const toggleMainCamera = () => {
    if (remainingMainPhotos <= 0) return

    console.log('PhotographSection: Toggling main camera, current state:', mainCameraActive)

    if (!mainCameraActive) {
      // Start camera
      setMainCameraActive(true)
    } else {
      // Camera is already active, stop it
      setMainCameraActive(false)
    }
  }

  const toggleExceptionCamera = () => {
    if (remainingExceptionPhotos <= 0) return

    console.log('PhotographSection: Toggling exception camera, current state:', exceptionCameraActive)

    if (!exceptionCameraActive) {
      // Start camera
      setExceptionCameraActive(true)
    } else {
      // Camera is already active, stop it
      setExceptionCameraActive(false)
    }
  }


  const remainingMainPhotos = 4 - mainPhotoIndexRef.current
  const remainingExceptionPhotos = 4 - exceptionPhotoIndexRef.current

  return (
    <div className="space-y-6">
  
      {/* Photograph capture interface with two sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Main Photograph Section */}
        <div className="bg-white border border-gray-300 rounded">
          <div className="bg-blue-100 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={toggleMainCamera}
                title={remainingMainPhotos > 0 ? (mainCameraActive ? "Capture Photo" : "Camera") : "Camera disabled"}
              >
                <AadhaarIcon />
              </div>
              <span className="text-sm font-medium text-gray-800">
                Photograph
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Score</span>
              <Input
                className="bg-white border-gray-400 h-5 w-12 text-center text-xs"
                value={`${mainPhotoScore}%`}
                readOnly
              />
            </div>
          </div>
          <div className="p-3">
            {mainCameraActive ? (
              <div className="space-y-4">
                {/* Camera preview area */}
                <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center">
                  <CameraComponent
                    ref={mainCameraRef}
                    onPhotoCapture={handleMainPhotoCapture}
                    onClose={() => setMainCameraActive(false)}
                    showCaptureButton={remainingMainPhotos > 0}
                    inline={false}
                  />
                </div>
              </div>
            ) : mainPhotos.length === 0 ? (
              <div className="space-y-4">
                {/* Camera preview area - empty when camera is off */}
                <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center">
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display the latest captured photo */}
                <div className="bg-black w-full h-48 border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={mainPhotos[mainPhotos.length - 1]}
                    alt="Latest capture"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Thumbnail gallery */}
                <div className="flex gap-2 overflow-x-auto">
                  {mainPhotos.map((photo, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={photo}
                        alt={`Capture ${index + 1}`}
                        className="w-12 h-12 object-cover border-2 border-gray-300 rounded"
                      />
                      <button
                        onClick={() => removeMainPhoto(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Capture more button if available */}
                {remainingMainPhotos > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setMainCameraActive(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
                    >
                      Capture More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Exception Photograph Section */}
        <div className="bg-white border border-gray-300 rounded">
          <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={toggleExceptionCamera}
                title={remainingExceptionPhotos > 0 ? (exceptionCameraActive ? "Capture Photo" : "Camera") : "Camera disabled"}
              >
                <AadhaarIcon />
              </div>
              <span className="text-sm font-medium text-gray-800">
                Exception Photograph
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Score</span>
              <Input
                className="bg-white border-gray-400 h-5 w-12 text-center text-xs"
                value={`${exceptionPhotoScore}%`}
                readOnly
              />
            </div>
          </div>
          <div className="p-3">
            {exceptionCameraActive ? (
              <div className="space-y-4">
                {/* Camera preview area */}
                <div className="bg-black w-full h-64 border border-gray-400 flex items-center justify-center">
                  <CameraComponent
                    ref={exceptionCameraRef}
                    onPhotoCapture={handleExceptionPhotoCapture}
                    onClose={() => setExceptionCameraActive(false)}
                    showCaptureButton={remainingExceptionPhotos > 0}
                    inline={false}
                  />
                </div>
              </div>
            ) : exceptionPhotos.length === 0 ? (
              <div className="space-y-4">
                {/* Camera preview area - empty when camera is off */}
                <div className="bg-gray-600 w-full h-64 border border-gray-400 flex items-center justify-center">
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display the latest captured photo */}
                <div className="bg-black w-full h-48 border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={exceptionPhotos[exceptionPhotos.length - 1]}
                    alt="Latest exception capture"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Thumbnail gallery */}
                <div className="flex gap-2 overflow-x-auto">
                  {exceptionPhotos.map((photo, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={photo}
                        alt={`Exception Capture ${index + 1}`}
                        className="w-12 h-12 object-cover border-2 border-gray-300 rounded"
                      />
                      <button
                        onClick={() => removeExceptionPhoto(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Capture more button if available */}
                {remainingExceptionPhotos > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setExceptionCameraActive(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
                    >
                      Capture More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
