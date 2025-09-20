import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
  machineId?: string;
  location?: string;
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
  const fetchAttemptedRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      if (fetchAttemptedRef.current) return;
      fetchAttemptedRef.current = true;

      try {
        /* Use Better Auth's built-in session endpoint directly */
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });

        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.user) {
            // Transform the data to match our expected format
            const transformedSession = {
              user: {
                ...sessionData.user,
                operatorUid: sessionData.user.operatorUid || sessionData.user.aadhaarNumber,
                operatorName: sessionData.user.name,
                machineId: sessionData.user.machineId || 'MP_0515_ML_NSS42224',
                location: sessionData.user.location || '22°28\'1.391579 N,80°6\'49.42383" E',
              },
              session: sessionData.session
            };
            setSession(transformedSession);
            setStatus('authenticated');
          } else {
            setStatus('unauthenticated');
            setSession(null);
          }
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

    if (hasMounted) {
      fetchSession();
    }
  }, [hasMounted]);

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