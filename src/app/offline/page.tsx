import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/no-wifi.png"
            alt="No WiFi"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">You're Offline</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you've lost your internet connection. Some features may not be available.
        </p>
        <div className="space-y-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-semibold">What you can do:</p>
            <ul className="list-disc list-inside mt-2 text-left">
              <li>Check your internet connection</li>
              <li>Try refreshing the page when you're back online</li>
              <li>Cached pages may still be available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}