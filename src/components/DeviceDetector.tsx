"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeviceDetectorProps {
  onDeviceSelect?: (device: string) => void
  selectedDevice?: string
}

interface DeviceInfo {
  id: string
  name: string
  type: 'scanner' | 'printer' | 'unknown'
  status: 'available' | 'unavailable' | 'unknown'
}

export default function DeviceDetector({ onDeviceSelect, selectedDevice }: DeviceDetectorProps) {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real device detection - fetches actual connected devices from API
  const detectDevices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/devices/detect')
      const data = await response.json()

      if (data.success) {
        setDevices(data.devices)
      } else {
        setError(data.error || 'Failed to detect devices')
      }
    } catch (err) {
      setError('Failed to detect devices. Please ensure devices are connected and permissions are granted.')
      console.error('Device detection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-detect devices on component mount
  useEffect(() => {
    detectDevices()
  }, [])

  const handleDeviceSelect = (deviceId: string) => {
    if (onDeviceSelect) {
      onDeviceSelect(deviceId)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'scanner': return '📡'
      case 'printer': return '🖨️'
      default: return '🔌'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅'
      case 'unavailable': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'unavailable': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Select component for device selection */}
      <Select value={selectedDevice || ""} onValueChange={handleDeviceSelect}>
        <SelectTrigger className="bg-white border-gray-400 h-8 w-80">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {devices
            .filter(device => device.type === 'scanner' && device.status === 'available')
            .map((device) => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center gap-2">
                  <span>{getDeviceIcon(device.type)}</span>
                  <span>{device.name}</span>
                  <span className={`text-xs ${getStatusColor(device.status)}`}>
                    {getStatusIcon(device.status)}
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {devices.length === 0 && !isLoading && !error && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm">No devices detected</p>
          <p className="text-xs">Click the refresh button to scan again</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-2xl mb-2 animate-spin">⏳</div>
          <p className="text-sm">Scanning for devices...</p>
        </div>
      )}
    </div>
  )
}