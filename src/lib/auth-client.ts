import { createAuthClient } from "better-auth/react";
import { useCallback, useMemo } from "react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export the Better Auth client methods
export const { signIn, signOut } = authClient;

// Custom useSession hook that uses our custom session endpoint
export const useSession = () => {
  const { data: originalSession, status } = authClient.useSession();

  // Create a custom fetch function to get our enhanced session data
  const getEnhancedSession = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth-custom-session`, {
        credentials: 'include',
      });

      if (response.ok) {
        const enhancedSession = await response.json();
        return enhancedSession;
      }
    } catch (error) {
      console.error('Error fetching enhanced session:', error);
    }

    // Fallback to original session
    return originalSession;
  }, [originalSession]);

  // Memoize the enhanced session to prevent recreation on every render
  const enhancedSession = useMemo(() => {
    if (!originalSession) return null;

    return {
      ...originalSession,
      user: {
        ...originalSession.user,
        role: originalSession.user?.role || 'operator',
        operatorUid: originalSession.user?.operatorUid,
        operatorName: originalSession.user?.operatorName,
      }
    };
  }, [originalSession]);

  return {
    data: enhancedSession,
    status,
    refresh: getEnhancedSession,
  };
};