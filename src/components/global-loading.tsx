export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <img
            src="/loader.gif"
            alt="Loading UCL Portal..."
            width={64}
            height={64}
            className="mx-auto animate-pulse"
          />
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">Loading UCL Portal...</p>
          <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  )
}