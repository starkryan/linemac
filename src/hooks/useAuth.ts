"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  operatorUid: string;
  operatorName: string;
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
  const hasCheckedRef = useRef(false);

  const checkSession = useCallback(async () => {
    if (hasCheckedRef.current) return;

    try {
      const response = await fetch('/api/auth-custom-session', {
        credentials: 'include',
      });

      if (!response.ok) {
        // If session is not valid or user is not authenticated
        if (response.status === 401) {
          setState({ user: null, loading: false });
          return;
        }
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      // Use the custom session data with all fields
      setState({ user: data?.user || null, loading: false });
    } catch (error) {
      console.error("Session check failed:", error);
      setState({ user: null, loading: false });
      // Optionally redirect to login if not on login page already
      // if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      //   router.push('/login'); // Assuming login page is at /login
      // }
    } finally {
      hasCheckedRef.current = true;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
