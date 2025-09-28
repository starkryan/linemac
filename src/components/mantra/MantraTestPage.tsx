'use client';

import React, { useState } from 'react';
import DeviceDiscovery from './DeviceDiscovery';
import DeviceInfo from './DeviceInfo';
import FingerprintCapture from './FingerprintCapture';
import ResponseDisplay from './ResponseDisplay';
import RemoteDeviceConfig from './RemoteDeviceConfig';
import DirectRDService from './DirectRDService';

const MantraTestPage: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<{ host: string; port: number; authKey?: string } | null>(null);

  const handleDeviceDiscovered = (info: any) => {
    setDeviceInfo(info);
  };

  const handleResponse = (response: any) => {
    setLastResponse(response);
    setShowResponse(true);
  };

  const handleRemoteDeviceConfigured = (config: { host: string; port: number; authKey?: string }) => {
    setRemoteConfig(config);
    console.log('Remote device configured:', config);
  };

  const clearResponse = () => {
    setLastResponse(null);
    setShowResponse(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mantra RDService Test Interface</h1>
          <p className="text-gray-600">
            Test your Mantra biometric device connection and functionality
          </p>
        </div>

        <div className="space-y-6">
          {/* Direct RDService Component - Works from any hosting */}
          <DirectRDService
            onResponse={handleResponse}
          />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Alternative: Server-Based Communication</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use these components if you need server-based communication (requires RDService accessible from server)
            </p>

            {/* Remote Device Configuration */}
            <RemoteDeviceConfig
              onDeviceConfigured={handleRemoteDeviceConfigured}
              onResponse={handleResponse}
            />

            {/* Device Discovery */}
            <DeviceDiscovery
              onDeviceDiscovered={handleDeviceDiscovered}
              onResponse={handleResponse}
            />

            {/* Device Information */}
            <DeviceInfo
              deviceInfo={deviceInfo}
              onResponse={handleResponse}
            />

            {/* Fingerprint Capture */}
            <FingerprintCapture
              onResponse={handleResponse}
            />
          </div>

          {/* Response Display */}
          {lastResponse && (
            <div className="flex justify-end mb-4">
              <button
                onClick={clearResponse}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Response
              </button>
            </div>
          )}

          <ResponseDisplay
            response={lastResponse}
            isVisible={showResponse}
          />

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Help & Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Direct RDService (Recommended)</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Works from any hosting (uclippb.com, etc.)</li>
                  <li>• Communicates directly with your local RDService</li>
                  <li>• No server configuration required</li>
                  <li>• Just ensure RDService is running locally</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Server-Based Alternative</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Use "Remote Device Configuration" for VPS setups</li>
                  <li>• Configure authentication for remote access</li>
                  <li>• Test connection before using device features</li>
                  <li>• Ensure proper network connectivity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Troubleshooting</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Check RDService is running on ports 11100-11105</li>
                  <li>• Verify Windows Firewall allows localhost connections</li>
                  <li>• Ensure Mantra device drivers are installed</li>
                  <li>• Test with official Mantra test page first</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Development Mode Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">Development Mode</span>
              </div>
              <p className="mt-2 text-sm text-yellow-700">
                You are running in development mode. Mock responses will be returned for all device operations.
                This allows you to test the interface without requiring actual hardware.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MantraTestPage;