import { createAuthClient } from "better-auth/react";
import { useCallback, useMemo } from "react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export the Better Auth client methods
export const { signIn, signOut } = authClient;

// Custom useSession hook that uses our custom session endpoint
export const useSession = () => {
  const { data: betterAuthSession, isPending, error } = authClient.useSession();

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
    } catch (err) {
      console.error('Error fetching enhanced session:', err);
    }

    // Fallback to null if we can't get enhanced session
    return null;
  }, []);

  // Use betterAuthSession only to determine if we should fetch enhanced session
  const shouldFetchEnhanced = betterAuthSession && !error;

  // Memoize the enhanced session data
  const enhancedSession = useMemo(() => {
    // Return null if we don't have a base session or there's an error
    if (!shouldFetchEnhanced) return null;

    // The enhanced session will be fetched via getEnhancedSession when needed
    // For now, return null and let the component call refresh when needed
    return null;
  }, [shouldFetchEnhanced]);

  const status = isPending ? "loading" : error ? "error" : betterAuthSession ? "authenticated" : "unauthenticated";

  return {
    data: enhancedSession,
    status,
    isPending,
    error,
    refresh: getEnhancedSession,
  };
};