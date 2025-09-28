"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Button } from "@/components/ui/button"
import Webcam from "react-webcam"
import { Camera, RotateCcw } from "lucide-react"

interface CameraComponentProps {
  onPhotoCapture: (photoData: string) => void
  onClose: () => void
  showCaptureButton?: boolean
  inline?: boolean
  captureDataAttr?: string
}

export interface CameraComponentRef {
  startCamera: () => void
}

const CameraComponent = forwardRef<CameraComponentRef, CameraComponentProps>(
  ({ onPhotoCapture, onClose, showCaptureButton = true, inline = false, captureDataAttr }, ref) => {
    const webcamRef = useRef<Webcam>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [isCameraStarting, setIsCameraStarting] = useState(false)
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)

    // Expose the startCamera method to parent component
    useImperativeHandle(ref, () => ({
      startCamera
    }))

    const videoConstraints = {
      width: { ideal: inline ? 640 : 1280 },
      height: { ideal: inline ? 480 : 720 },
      facingMode: 'user' as const,
      aspectRatio: 16/9,
      frameRate: { ideal: 30 }
    }

    const startCamera = useCallback(() => {
      console.log('Camera: Starting camera with react-webcam')
      setIsCameraStarting(true)
      setCameraError(null)
      setIsCameraActive(false)

      // The Webcam component will automatically start when mounted
      // We just need to reset our state
      setTimeout(() => {
        setIsCameraActive(true)
        setIsCameraStarting(false)
      }, 100)
    }, [])

    const capturePhoto = useCallback(() => {
      if (webcamRef.current) {
        try {
          const imageSrc = webcamRef.current.getScreenshot()
          if (imageSrc) {
            setCapturedPhoto(imageSrc)
            onPhotoCapture(imageSrc)

            // For inline mode, auto-reset after capture
            // For non-inline mode, close camera after capture
            if (inline) {
              setTimeout(() => {
                setCapturedPhoto(null)
              }, 1000) // Show captured photo for 1 second, then reset for next capture
            } else {
              // Close camera after successful capture in non-inline mode
              setTimeout(() => {
                onClose()
              }, 500) // Brief delay to show captured photo before closing
            }
          }
        } catch (error) {
          console.error('Error capturing photo:', error)
          setCameraError('Failed to capture photo')
        }
      }
    }, [onPhotoCapture, onClose, inline])

    const retakePhoto = useCallback(() => {
      setCapturedPhoto(null)
    }, [])

    const stopCamera = useCallback(() => {
      console.log('Camera: Stopping camera')
      setIsCameraActive(false)
      setIsCameraStarting(false)
      setCapturedPhoto(null)
      setCameraError(null)
      onClose()
    }, [onClose])

    const handleUserMedia = useCallback(() => {
      console.log('Camera: User media obtained')
      setIsCameraActive(true)
      setIsCameraStarting(false)
      setCameraError(null)
    }, [])

    const handleUserMediaError = useCallback((error: any) => {
      console.error('Camera: User media error:', error)
      setIsCameraStarting(false)
      setIsCameraActive(false)
      let errorMessage = 'Unable to access camera'

      // Handle specific error types
      if (error?.name) {
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.'
            break
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            errorMessage = 'No camera found. Please ensure your device has a camera connected.'
            break
          case 'NotReadableError':
          case 'TrackStartError':
            errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.'
            break
        }
      }

      setCameraError(errorMessage)
    }, [])

    if (inline) {
      return (
        <div className="w-full h-full flex flex-col bg-black">
          {/* Camera Preview / Captured Photo */}
          <div className="flex-1 flex items-center justify-center bg-black relative min-h-[400px]">
            {isCameraStarting && (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <div className="text-sm">Starting camera...</div>
              </div>
            )}

            {!isCameraActive && !isCameraStarting && !capturedPhoto && (
              <div className="text-center text-white">
                {cameraError && (
                  <div className="text-red-400 text-sm p-2">{cameraError}</div>
                )}
                {!cameraError && (
                  <>
                    <div className="mb-4">📷</div>
                    <div className="text-sm">Camera is off</div>
                    <div className="text-xs text-gray-400">Click the camera icon above to start</div>
                  </>
                )}
              </div>
            )}

            {isCameraActive && !capturedPhoto && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  mirrored={false}
                  className="max-w-full max-h-full object-contain bg-black"
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
              />
            )}
          </div>

          {/* Capture Button */}
          {isCameraActive && !capturedPhoto && showCaptureButton && (
            <div className="p-2 bg-black flex justify-center">
              <Button
                onClick={capturePhoto}
                className="w-12 h-12 rounded-full bg-red-600 text-white border-2 border-white hover:bg-red-700 flex items-center justify-center"
                {...(captureDataAttr ? { [`data-${captureDataAttr}`]: "true" } : {})}
              >
                <Camera className="w-6 h-6 text-white" />
              </Button>
            </div>
          )}
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
            Close
          </Button>

          {!isCameraActive && !capturedPhoto && (
            <Button
              onClick={startCamera}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              ▶️ Camera
            </Button>
          )}

          {capturedPhoto && (
            <div className="flex gap-2">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700"
              >
               <RotateCcw className="w-4 h-4 mr-2" />
               Retake
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
        <div className="flex-1 flex items-center justify-center bg-black relative min-h-[400px]">
          {isCameraStarting && (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-sm">Starting camera...</div>
            </div>
          )}

          {!isCameraActive && !isCameraStarting && !capturedPhoto && (
            <div className="text-center text-white">
              {cameraError && (
                <div className="text-red-400 text-sm p-2">{cameraError}</div>
              )}
              {!cameraError && (
                <>
                  <div className="mb-4">📷</div>
                  <div className="text-sm">Camera is off</div>
                  <div className="text-xs text-gray-400">Click the camera icon above to start</div>
                </>
              )}
            </div>
          )}

          {isCameraActive && !capturedPhoto && (
            <div className="relative flex items-center justify-center w-full h-full">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                mirrored={false}
                className="max-w-full max-h-full object-contain bg-black"
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
            />
          )}
        </div>

        {/* Capture Button */}
        {isCameraActive && !capturedPhoto && showCaptureButton && (
          <div className="p-4 bg-black flex justify-center">
            <Button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-red-600 text-white border-4 border-white hover:bg-red-700 flex items-center justify-center"
              {...(captureDataAttr ? { [`data-${captureDataAttr}`]: "true" } : {})}
            >
              <Camera className="w-8 h-8 text-white" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)
export default CameraComponent