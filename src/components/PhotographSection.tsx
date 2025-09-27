"use client"

import { useState, useRef } from "react"
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

  const handleMainPhotoCapture = (photoData: string) => {
    // Add to exception photos (display in second box)
    setExceptionPhotos(prev => [...prev, photoData])
    mainPhotoIndexRef.current++

    // Simulate quality score (in real app, this would be calculated)
    const score = Math.floor(Math.random() * 40) + 60 // 60-99%
    setMainPhotoScore(score)

    if (onPhotoCountChange) {
      onPhotoCountChange(4 - mainPhotoIndexRef.current, 4 - exceptionPhotoIndexRef.current)
    }
  }

  const handleExceptionPhotoCapture = (photoData: string) => {
    // Add to main photos (display in first box)
    setMainPhotos(prev => [...prev, photoData])
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

  const toggleMainCamera = () => {
    if (remainingMainPhotos <= 0) return

    if (!mainCameraActive) {
      // Directly start camera without any delay
      setMainCameraActive(true)
    } else {
      // Camera is already active, capture photo directly
      // Simulate the capture by creating a photo data
      captureMainPhotoDirectly()
    }
  }

  const toggleExceptionCamera = () => {
    if (remainingExceptionPhotos <= 0) return

    if (!exceptionCameraActive) {
      // Directly start camera without any delay
      setExceptionCameraActive(true)
    } else {
      // Camera is already active, capture photo directly
      captureExceptionPhotoDirectly()
    }
  }

  const captureMainPhotoDirectly = () => {
    // Find the main camera component and trigger capture
    const mainCameraElement = document.querySelector('[data-main-capture="true"]') as HTMLButtonElement
    if (mainCameraElement) {
      mainCameraElement.click()
    }
  }

  const captureExceptionPhotoDirectly = () => {
    // Find the exception camera component and trigger capture
    const exceptionCameraElement = document.querySelector('[data-exception-capture="true"]') as HTMLButtonElement
    if (exceptionCameraElement) {
      exceptionCameraElement.click()
    }
  }


  const remainingMainPhotos = 4 - mainPhotoIndexRef.current
  const remainingExceptionPhotos = 4 - exceptionPhotoIndexRef.current

  return (
    <div className="space-y-6">
  
      {/* Photograph capture interface with two sections */}
      <div className="grid grid-cols-2 gap-6">
        {/* Main Photograph Section */}
        <div className="bg-white border border-gray-300 rounded">
          <div className="bg-blue-100 px-4 py-2 flex items-center justify-between">
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
              <span className="text-sm text-gray-700">Score</span>
              <Input
                className="bg-white border-gray-400 h-6 w-16 text-center"
                value={`${mainPhotoScore}%`}
                readOnly
              />
            </div>
          </div>
          <div className="p-4">
            {mainCameraActive ? (
              <CameraComponent
                onPhotoCapture={handleMainPhotoCapture}
                onClose={() => setMainCameraActive(false)}
                showCaptureButton={remainingMainPhotos > 0}
                inline={true}
                captureDataAttr="main-capture"
              />
            ) : mainPhotos.length === 0 ? (
              <div className="space-y-4">
                {/* Camera preview area */}
                <div className="bg-black w-full h-96 border border-gray-400 flex items-center justify-center">
                  {mainCameraActive ? (
                    <CameraComponent
                      onPhotoCapture={handleMainPhotoCapture}
                      onClose={() => setMainCameraActive(false)}
                      showCaptureButton={remainingMainPhotos > 0}
                      inline={true}
                      captureDataAttr="main-capture"
                    />
                  ) : null}
                </div>

                {/* Capture button */}
                {mainCameraActive && remainingMainPhotos > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={captureMainPhotoDirectly}
                      className="bg-red-600 text-white hover:bg-red-700 px-6 py-2"
                    >
                      Capture Photo
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Display the latest captured photo */}
                <div className="bg-black w-full h-80 border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={mainPhotos[mainPhotos.length - 1]}
                    alt="Latest capture"
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>

                {/* Thumbnail gallery */}
                <div className="flex gap-2 overflow-x-auto">
                  {mainPhotos.map((photo, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={photo}
                        alt={`Capture ${index + 1}`}
                        className="w-16 h-16 object-cover border-2 border-gray-300 rounded"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <button
                        onClick={() => removeMainPhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
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
              <span className="text-sm text-gray-700">Score</span>
              <Input
                className="bg-white border-gray-400 h-6 w-16 text-center"
                value={`${exceptionPhotoScore}%`}
                readOnly
              />
            </div>
          </div>
          <div className="p-4">
            {exceptionCameraActive ? (
              <div className="space-y-2">
                <CameraComponent
                  onPhotoCapture={handleExceptionPhotoCapture}
                  onClose={() => setExceptionCameraActive(false)}
                  showCaptureButton={remainingExceptionPhotos > 0}
                  inline={true}
                  captureDataAttr="exception-capture"
                />
                {/* Arrow play button for quick restart */}
                <div className="flex justify-center">
                  <Image
                    src="/arrow-play.png"
                    alt="Restart Camera"
                    width={32}
                    height={32}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={restartExceptionCamera}
                    title="Restart Camera"
                  />
                </div>
              </div>
            ) : exceptionPhotos.length === 0 ? (
              <div className="bg-gray-600 w-full h-96 border border-gray-400 flex items-center justify-center"></div>
            ) : (
              <div className="space-y-4">
                {/* Display the latest captured photo (from main section) */}
                <div className="bg-black w-full h-80 border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={exceptionPhotos[exceptionPhotos.length - 1]}
                    alt="Latest capture from main"
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>

                {/* Thumbnail gallery */}
                <div className="flex gap-2 overflow-x-auto">
                  {exceptionPhotos.map((photo, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={photo}
                        alt={`Exception Capture ${index + 1}`}
                        className="w-16 h-16 object-cover border-2 border-gray-300 rounded"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <button
                        onClick={() => removeExceptionPhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

         
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}