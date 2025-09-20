"use client"

import { User, Eye, Edit3, Search, RotateCcw, FileText, Settings, Square, MapPin } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"

interface UserSessionData {
  id: string
  name: string
  email: string
  aadhaarNumber?: string
  machineId?: string
  location?: string
  lastLogin?: string
}

export function StatusFooter() {
  const { session, isAuthenticated } = useAuthGuard(false)

  // Format current timestamp
  const getCurrentTimestamp = () => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  // Get user data for display
  const getUserData = (): UserSessionData => {
    if (!session || !isAuthenticated) {
      return {
        id: 'GUEST',
        name: 'Guest User',
        email: 'guest@ucl.com',
        machineId: 'MP_0515_ML_NSS42224',
        location: 'Client Location Not Defined'
      }
    }

    const user = session.user;
    return {
      id: user.id || 'UNKNOWN',
      name: user.name || 'Unknown User',
      email: user.email || '',
      aadhaarNumber: user.operatorUid || '820-0515-57084',
      machineId: user.machineId || 'MP_0515_ML_NSS42224',
      location: user.location || '22°28\'1.391579 N,80°6\'49.42383" E',
      lastLogin: session.session?.createdAt ? new Date(session.session.createdAt).toLocaleString('en-IN') : getCurrentTimestamp()
    }
  }

  const userData = getUserData()
  const version = "3.3.4.2(182-3)"

  return (
    <div className="relative bg-gray-900 border-t border-gray-700 px-2 py-1 flex items-center justify-between text-xs text-gray-300 mt-auto">
      {/* Left side icons */}
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-700 rounded" title="User Profile">
          <User className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="Documents">
          <FileText className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="View">
          <Eye className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="Edit">
          <Edit3 className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="Search">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="Refresh">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded bg-red-600" title="Stop">
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Right side status information */}
      <div className="flex items-center gap-4 text-xs">
        <span className="bg-red-600 px-2 py-0.5 rounded text-white font-medium">R</span>
        <span>({userData.machineId}) {userData.name.toLowerCase()}</span>
        <span>{userData.aadhaarNumber}-Client Location Not Defined</span>
        <span>version {version}</span>
        <span>{userData.lastLogin}</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>Location: {userData.location}</span>
        </div>
        <div className="w-6 h-6 bg-gray-600 rounded border border-gray-500 flex items-center justify-center">
          <span className="text-xs">📊</span>
        </div>
      </div>
    </div>
  )
}