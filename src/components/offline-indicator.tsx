"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set up online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse">
      <Image
        src="/no-wifi.png"
        alt="No WiFi"
        width={24}
        height={24}
        className="w-6 h-6"
      />
      <span className="font-semibold">OFFLINE</span>
    </div>
  );
}