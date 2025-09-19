import { User, Eye, Edit3, Search, RotateCcw, FileText, Settings, Square, MapPin } from "lucide-react"

export function StatusFooter() {
  return (
    <div className="relative bg-gray-900 border-t border-gray-700 px-2 py-1 flex items-center justify-between text-xs text-gray-300 mt-auto">
      {/* Left side icons */}
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-700 rounded">
          <User className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <FileText className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <Eye className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <Edit3 className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded bg-red-600">
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Right side status information */}
      <div className="flex items-center gap-4 text-xs">
        <span className="bg-red-600 px-2 py-0.5 rounded text-white font-medium">R</span>
        <span>(MP_0515_ML_NSS42224) priyanka patel</span>
        <span>820-0515-57084-Client Location Not Defined</span>
        <span>version 3.3.4.2(182-3</span>
        <span>28-May-2024 03:28:50 PM</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>Location: 22°28&apos;1.391579 N,80°6&apos;49.42383&quot; E</span>
        </div>
        <div className="w-6 h-6 bg-gray-600 rounded border border-gray-500 flex items-center justify-center">
          <span className="text-xs">📊</span>
        </div>
      </div>
    </div>
  )
}
