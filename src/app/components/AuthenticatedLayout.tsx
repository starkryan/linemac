"use client";

import AadhaarHeaderUI from "@/app/components/AadhaarHeaderUI";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  required?: boolean;
}

export default function AuthenticatedLayout({ children, required = true }: AuthenticatedLayoutProps) {
  const { isPending, isAuthenticated, hasMounted } = useAuthGuard(required);

  // Prevent flash of loading state during initial render
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && required) {
    return null; // Will redirect in useAuthGuard hook
  }

  if (!required) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AadhaarHeaderUI />
      {children}
    </div>
  );
}