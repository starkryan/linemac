import { useAuthGuard } from "./useAuthGuard";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const router = useRouter();
  const { session, isAuthenticated, isPending, hasMounted } = useAuthGuard(false);

  return {
    user: session?.user || null,
    session: session?.session || null,
    loading: isPending,
    isAuthenticated,
    logout: async () => {
      try {
        console.log('Logout clicked - using Better Auth sign-out');
        // Use Better Auth's built-in sign-out method
        await authClient.signOut();

        console.log('Better Auth sign-out completed');

        // Force a full page reload to clear client-side state
        window.location.href = '/';
      } catch (error) {
        console.error("Logout failed:", error);
        // Even if the API call fails, still redirect to home
        window.location.href = '/';
      }
    }
  };
}