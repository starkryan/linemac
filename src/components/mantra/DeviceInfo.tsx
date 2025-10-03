'use client';

import React, { useState } from 'react';

interface DeviceInfoProps {
  deviceInfo: any;
  onResponse: (response: any) => void;
}

const DeviceInfo: React.FC<DeviceInfoProps> = ({ deviceInfo, onResponse }) => {
  const [loading, setLoading] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getDeviceInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mantra/deviceinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: 11101 }),
      });

      const data = await response.json();
      onResponse(data);

      if (data.ok && data.result?.parsed) {
        setCurrentInfo(data.result.parsed);
      } else if (!data.ok) {
        setError(data.message || 'Failed to get device info');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Network error occurred while getting device info'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceInfo = (info: any) => {
    if (!info) return null;

    const params = info.params || {};
    const deviceParams = info.deviceInfo || {};

    const allParams = { ...params, ...deviceParams };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(allParams).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-gray-600">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Device Information</h2>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={getDeviceInfo}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Getting Info...
            </div>
          ) : (
            'Get Device Info'
          )}
        </button>

        <div className="text-sm text-gray-600">
          Retrieve detailed information about the connected device
        </div>
      </div>

      {deviceInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Discovered Device</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            {renderDeviceInfo({ ...deviceInfo })}
          </div>
        </div>
      )}

      {currentInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Current Device Info</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {renderDeviceInfo(currentInfo)}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">Device Info Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

    </div>
  );
};

export default DeviceInfo;