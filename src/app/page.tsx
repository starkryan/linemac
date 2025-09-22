"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
          if (sessionData?.user) {
            router.push("/aadhaar-correction");
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/loader.gif"
            alt="Loading UCL Portal..."
            width={64}
            height={64}
            className="mx-auto animate-pulse mb-4"
          />
          <p className="text-gray-600">Loading UCL Portal...</p>
        </div>
      </div>
    );
  }

  return null; // Will redirect in useEffect
}
