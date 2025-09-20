'use client';

import { useEffect, useState } from 'react';

interface RDServiceLoaderProps {
  onServiceLoaded: (success: boolean) => void;
}

export function RDServiceLoader({ onServiceLoaded }: RDServiceLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRDService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create a script element to load the RD Service
        // In a real implementation, this would load from the actual RD Service URL
        const script = document.createElement('script');

        // For now, simulate the RD Service interface
        // In production, this would be: script.src = 'http://localhost:11100/rd/capture';

        // Simulate RD Service functions
        // @ts-ignore
        window.RDService = {
          CheckRDPort: () => Promise.resolve(true),
          Capture: (options: any) => Promise.resolve('<?xml version="1.0"?><Pid>...</Pid>'),
          GetDeviceInfo: () => Promise.resolve({
            dpId: 'Morpho_MSO_1300_E2',
            rdsId: 'RD123456',
            rdsVer: '1.0'
          })
        };

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));

        onServiceLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load RD Service');
        onServiceLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadRDService();
  }, [onServiceLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <img
          src="/loader.gif"
          alt="Loading RD Service..."
          width={32}
          height={32}
          className="animate-pulse"
        />
        <span className="ml-3 text-gray-600">Loading RD Service...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 text-sm">RD Service Error: {error}</span>
        </div>
      </div>
    );
  }

  return null;
}