import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuthGuard(required = true) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || isPending) return;

    if (!session && required) {
      router.push("/login");
    }
  }, [session, isPending, required, router, hasMounted]);

  useEffect(() => {
    if (error) {
      // Only log meaningful errors, ignore "no session" or network errors
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message;
        // Don't log common non-critical errors
        if (!errorMessage.includes('Failed to fetch') &&
            !errorMessage.includes('no session') &&
            !errorMessage.includes('Network')) {
          console.error("Authentication error in useAuthGuard:", errorMessage);
        }
      }
    }
  }, [error]);

  return {
    session,
    isPending,
    error,
    hasMounted,
    isAuthenticated: !!session && hasMounted && !isPending
  };
}