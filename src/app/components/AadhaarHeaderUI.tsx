"use client";

import React from "react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Example icons: you can replace with lucide-react or your own PNG/SVGs in public/
// For now, I'll use placeholders like "/profile.png" etc.

export default function AadhaarHeader() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      console.error("Session error:", error);
      // Don't redirect immediately to avoid loops, just log the error
    }
  }, [error]);

  // Only show header if user is authenticated
  if (isPending) {
    return (
      <header className="w-full bg-gradient-to-b from-blue-100 to-blue-200 border-b flex items-center justify-between px-4 py-2">
        <div className="text-sm text-blue-900">Loading...</div>
      </header>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      // Better Auth will handle the redirect automatically
      // but we'll add a fallback redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback to manual redirect if signOut fails
      window.location.href = "/";
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-blue-100 to-blue-200 border-b flex items-center justify-between px-4 py-2">
      {/* Left: Aadhaar Logo */}
      <div className="flex items-center space-x-2">
        <Image
          src="/logo.png"
          alt="Aadhaar Logo"
          width={50}
          height={50}
          className="object-contain"
        />
     
      </div>

      {/* Right: Menu Icons */}
      <nav className="flex items-center space-x-6">
        <button
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Profile"
        >
          <Image src="/tb-profile.png" alt="Profile" width={24} height={24} />
          <span>Profile</span>
        </button>
        <button
          onClick={() => router.push('/report')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Report"
        >
          <Image src="/tb-report.png" alt="Report" width={24} height={24} />
          <span>Report</span>
        </button>
        <button
          onClick={() => router.push('/new-enroll')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="New Enroll"
        >
          <Image src="/tb-new.png" alt="New Enroll" width={24} height={24} />
          <span>New Enroll</span>
        </button>
        <button
          onClick={() => router.push('/child-enroll')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Child Enroll"
        >
          <Image src="/child_enrol.png" alt="Child Enroll" width={24} height={24} />
          <span>Child Enroll</span>
        </button>
        <button
          onClick={() => router.push('/aadhaar-correction')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Update Data"
        >
          <Image src="/tb-enrol.png" alt="Update Data" width={24} height={24} />
          <span>Update Data</span>
        </button>
        <button
          onClick={() => router.push('/list')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="List"
        >
          <Image src="/userlist.png" alt="List" width={24} height={24} />
          <span>List</span>
        </button>
        <button
          onClick={() => router.push('/child-list')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Child List"
        >
          <Image src="/userlist.png" alt="Child List" width={24} height={24} />
          <span>Child List</span>
        </button>
        <button
          onClick={() => router.push('/life-cycle')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Life Cycle"
        >
          <Image src="/tb-lifecycle.png" alt="Life Cycle" width={24} height={24} />
          <span>Life-Cycle</span>
        </button>
        <button
          onClick={() => router.push('/wallet')}
          className="flex flex-col items-center text-xs hover:bg-blue-300 rounded p-1 transition-colors"
          title="Wallet"
        >
          <Image src="/wallet.png" alt="Wallet" width={24} height={24} />
          <span>Wallet</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs hover:bg-red-100 rounded p-1 transition-colors"
          title="Logout"
        >
          <Image src="/tb-logout.png" alt="Logout" width={24} height={24} />
          <span>Logout</span>
        </button>
      </nav>
    </header>
  );
}