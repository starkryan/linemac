'use client';

import React, { useState } from 'react';

interface DeviceDiscoveryProps {
  onDeviceDiscovered: (deviceInfo: any) => void;
  onResponse: (response: any) => void;
}

const DeviceDiscovery: React.FC<DeviceDiscoveryProps> = ({ onDeviceDiscovered, onResponse }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverDevice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mantra/discover?method=RDSERVICE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      onResponse(data);

      if (data.ok && data.result?.parsed?.info) {
        onDeviceDiscovered(data.result.parsed.info);
      } else if (!data.ok) {
        setError(data.message || 'Failed to discover device');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Network error occurred while discovering device'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Device Discovery</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={discoverDevice}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Discovering...
            </div>
          ) : (
            'Discover Device'
          )}
        </button>

        <div className="text-sm text-gray-600">
          Click to search for connected Mantra RDService devices
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">Discovery Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Note:</strong> This will search for Mantra RDService on port 11101</p>
        <p>In development mode, a mock device response will be returned</p>
      </div>
    </div>
  );
};

export default DeviceDiscovery;