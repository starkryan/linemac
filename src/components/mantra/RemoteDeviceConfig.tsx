'use client';

import React, { useState } from 'react';

interface RemoteDeviceConfigProps {
  onDeviceConfigured: (config: { host: string; port: number; authKey?: string }) => void;
  onResponse: (response: any) => void;
}

const RemoteDeviceConfig: React.FC<RemoteDeviceConfigProps> = ({
  onDeviceConfigured,
  onResponse
}) => {
  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<string>('11101');
  const [authKey, setAuthKey] = useState<string>('');
  const [useAuth, setUseAuth] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    if (!host) {
      onResponse({
        ok: false,
        error: 'Host is required'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/mantra/remote/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          port: parseInt(port),
          authKey: useAuth ? authKey : undefined,
          useFallback: false
        }),
      });

      const result = await response.json();
      setTestResult(result);
      onResponse(result);

      if (result.ok) {
        onDeviceConfigured({
          host,
          port: parseInt(port),
          authKey: useAuth ? authKey : undefined
        });
      }
    } catch (error: any) {
      const errorResponse = {
        ok: false,
        error: 'Connection test failed',
        message: error.message
      };
      setTestResult(errorResponse);
      onResponse(errorResponse);
    } finally {
      setIsTesting(false);
    }
  };

  const useLocalhost = () => {
    setHost('localhost');
    setPort('11101');
    setUseAuth(false);
    setAuthKey('');
  };

  const usePreset = (presetHost: string) => {
    setHost(presetHost);
    setPort('11101');
    setUseAuth(true);
    setAuthKey('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Remote Device Configuration
      </h2>

      <div className="space-y-4">
        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={useLocalhost}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
            >
              Localhost (Dev)
            </button>
            <button
              onClick={() => usePreset('192.168.1.100')}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
            >
              Office Server
            </button>
            <button
              onClick={() => usePreset('rdservice.example.com')}
              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm transition-colors"
            >
              Cloud Service
            </button>
          </div>
        </div>

        {/* Host Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RDService Host *
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="localhost, 192.168.1.100, rdservice.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Port Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min="1"
            max="65535"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Authentication */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useAuth"
            checked={useAuth}
            onChange={(e) => setUseAuth(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="useAuth" className="text-sm font-medium text-gray-700">
            Use Authentication
          </label>
        </div>

        {useAuth && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auth Key
            </label>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="Enter authentication key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Test Connection Button */}
        <button
          onClick={testConnection}
          disabled={isTesting || !host}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? 'Testing Connection...' : 'Test Connection'}
        </button>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${
            testResult.ok
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              testResult.ok ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.ok ? '✅ Connection Successful' : '❌ Connection Failed'}
            </h3>

            {testResult.ok && testResult.connection && (
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Host:</strong> {testResult.host}:{testResult.port}</p>
                <p><strong>Response Time:</strong> {testResult.responseTime}ms</p>
                <p><strong>Remote:</strong> {testResult.connection.remote ? 'Yes' : 'No'}</p>
                {testResult.mock && (
                  <p className="text-yellow-600"><strong>Note:</strong> Using mock response</p>
                )}
              </div>
            )}

            {!testResult.ok && testResult.error && (
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>Error:</strong> {testResult.error}</p>
                {testResult.message && (
                  <p><strong>Details:</strong> {testResult.message}</p>
                )}
                {testResult.connection?.error && (
                  <p><strong>Connection Error:</strong> {testResult.connection.error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Configuration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Configuration Information
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Localhost:</strong> For development when RDService runs on same machine</p>
            <p>• <strong>LAN IP:</strong> For RDService on local network (192.168.x.x)</p>
            <p>• <strong>Domain:</strong> For remote RDService with proper DNS</p>
            <p>• <strong>Authentication:</strong> Required for remote access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteDeviceConfig;