import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  operatorUid: string;
  operatorName: string;
}

interface SessionData {
  user: SessionUser;
  session: {
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
    id: string;
  };
}

export function useAuthGuard(required = true) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth-custom-session', {
          credentials: 'include',
        });

        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
          setSession(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setStatus('unauthenticated');
        setSession(null);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!hasMounted || status === 'loading') return;

    if (!session && required) {
      router.push("/login");
    }
  }, [session, status, required, router, hasMounted]);

  return {
    session,
    isPending: status === 'loading',
    error: null,
    hasMounted,
    isAuthenticated: status === 'authenticated' && !!session
  };
}