"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  onFileView?: () => void
  onFileRemove?: () => void
  acceptedTypes?: string
  maxSize?: number // in MB
  className?: string
}

export default function FileUpload({
  onFileSelect,
  onFileView,
  onFileRemove,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5,
  className = ""
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type must be one of: ${acceptedTypes}`)
      return
    }

    setFileName(file.name)
    onFileSelect?.(file)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = acceptedTypes
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    }
    input.click()
  }

  const handleRemove = () => {
    setFileName("")
    onFileRemove?.()
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
        id="file-upload"
      />

      {/* Upload button */}
      <Button
        variant="outline"
        size="sm"
        className="bg-white border-gray-400 h-8 w-8 p-0"
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        title={isDragging ? "Drop file here" : "Upload file"}
      >
        📎
      </Button>

      {/* View button - only enabled if file is selected */}
      <Button
        variant="outline"
        size="sm"
        className={`bg-white border-gray-400 h-8 w-8 p-0 ${!fileName ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onFileView}
        disabled={!fileName}
        title={fileName ? `View ${fileName}` : "No file selected"}
      >
        🗂️
      </Button>

      {/* Remove button - only enabled if file is selected */}
      {onFileRemove && (
        <Button
          variant="outline"
          size="sm"
          className={`bg-white border-red-400 text-red-600 h-8 w-8 p-0 ${!fileName ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleRemove}
          disabled={!fileName}
          title="Remove file"
        >
          ✕
        </Button>
      )}

      {/* File name display */}
      {fileName && (
        <span className="text-sm text-gray-600 truncate max-w-48" title={fileName}>
          {fileName}
        </span>
      )}
    </div>
  )
}