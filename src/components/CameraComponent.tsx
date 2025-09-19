"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface CameraComponentProps {
  onPhotoCapture: (photoData: string) => void
  onClose: () => void
  showCaptureButton?: boolean
  inline?: boolean
}

export default function CameraComponent({ onPhotoCapture, onClose, showCaptureButton = true, inline = false }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup: Stop camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: inline ? 640 : 1280 },
          height: { ideal: inline ? 480 : 720 },
          facingMode: 'user'
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to data URL
      const photoData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedPhoto(photoData)

      // Pass captured photo to parent
      onPhotoCapture(photoData)
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    setCapturedPhoto(null)
    onClose()
  }

  if (inline) {
    return (
      <div className="w-full h-full flex flex-col bg-black">
        {/* Camera Preview / Captured Photo */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {!isCameraActive && !capturedPhoto && (
            <div className="text-center text-white">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Click Aadhaar icon to start camera</p>
            </div>
          )}

          {isCameraActive && !capturedPhoto && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 border-2 border-green-400 pointer-events-none" style={{ margin: '10px' }}>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-400"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-400"></div>
              </div>
            </div>
          )}

          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Captured"
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
        </div>

        {/* Capture Button */}
        {isCameraActive && !capturedPhoto && showCaptureButton && (
          <div className="p-2 bg-black flex justify-center">
            <Button
              onClick={capturePhoto}
              className="w-12 h-12 rounded-full bg-red-600 text-white border-2 border-white hover:bg-red-700 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-2 bg-black flex justify-center gap-2">
          {capturedPhoto && (
            <>
              <Button
                onClick={retakePhoto}
                size="sm"
                className="bg-yellow-600 text-white hover:bg-yellow-700 h-8 px-3 text-xs"
              >
                🔄 Retake
              </Button>
              <Button
                onClick={stopCamera}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 text-xs"
              >
                ✓ Done
              </Button>
            </>
          )}
          {!isCameraActive && !capturedPhoto && (
            <Button
              onClick={startCamera}
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700 h-8 px-3 text-xs"
            >
              ▶️ Start
            </Button>
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Camera Controls */}
      <div className="p-4 bg-black flex justify-between items-center">
        <Button
          onClick={stopCamera}
          variant="outline"
          className="bg-red-600 text-white border-red-600 hover:bg-red-700"
        >
          ✕ Close
        </Button>

        {!isCameraActive && !capturedPhoto && (
          <Button
            onClick={startCamera}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            ▶️ Start Camera
          </Button>
        )}

        {capturedPhoto && (
          <div className="flex gap-2">
            <Button
              onClick={retakePhoto}
              variant="outline"
              className="bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700"
            >
              🔄 Retake
            </Button>
            {showCaptureButton && (
              <Button
                onClick={stopCamera}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                ✓ Use Photo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Camera Preview / Captured Photo */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {!isCameraActive && !capturedPhoto && (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg">Click "Start Camera" to begin</p>
          </div>
        )}

        {isCameraActive && !capturedPhoto && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute inset-0 border-4 border-green-400 pointer-events-none" style={{ margin: '20px' }}>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
            </div>
          </div>
        )}

        {capturedPhoto && (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="max-w-full max-h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
      </div>

      {/* Capture Button */}
      {isCameraActive && !capturedPhoto && showCaptureButton && (
        <div className="p-4 bg-black flex justify-center">
          <Button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-red-600 text-white border-4 border-white hover:bg-red-700 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </Button>
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}