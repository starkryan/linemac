"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  // Assuming role is stored in user metadata or a separate field.
  // For now, let's add it as optional. If Better Auth doesn't provide it directly,
  // you might need to fetch it from another source or add it to the user object after login.
  role?: string; 
  // Add other user properties as needed
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true, // Start with loading true
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/get-session');
        if (!response.ok) {
          // If session is not valid or user is not authenticated
          if (response.status === 401) {
            setState({ user: null, loading: false });
            return;
          }
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        // When there's no session, Better Auth returns null directly
        // When there is a session, it returns an object with user and session properties
        setState({ user: data?.user || null, loading: false });
      } catch (error) {
        console.error("Session check failed:", error);
        setState({ user: null, loading: false });
        // Optionally redirect to login if not on login page already
        // if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        //   router.push('/login'); // Assuming login page is at /login
        // }
      }
    };

    checkSession();
  }, [router]);

  const logout = async () => {
    try {
      // Use Better Auth's logout endpoint
      await fetch('/api/auth/sign-out', { method: 'POST' });

      setState({ user: null, loading: false });
      router.push('/'); // Redirect to home or login page
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, clear local state
      setState({ user: null, loading: false });
      router.push('/');
      router.refresh();
    }
  };

  return {
    ...state,
    logout,
  };
}
