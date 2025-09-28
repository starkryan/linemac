'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import MantraTestPage from '@/components/mantra/MantraTestPage';

export default function MantraTest() {
  // Protect this route - require authentication
  useAuthGuard(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <MantraTestPage />
    </div>
  );
}