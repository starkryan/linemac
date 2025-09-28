'use client';

import React, { useState } from 'react';

interface FingerprintCaptureProps {
  onResponse: (response: any) => void;
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({ onResponse }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureData, setCaptureData] = useState<any>(null);

  // Default PID options
  const [pidOptions, setPidOptions] = useState({
    fmr: 'false',
    ftype: '0',
    fcount: '1',
    icount: '0',
    pcount: '0',
    ptype: '0',
    format: '0',
    quality: '60',
    timeout: '10000',
    posh: 'LEFT_INDEX',
    wadh: 'E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWEqI='
  });

  const handlePidOptionChange = (key: string, value: string) => {
    setPidOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generatePidXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PidOptions ver="1.0">
  <Opts fmr="${pidOptions.fmr}" ftype="${pidOptions.ftype}" fcount="${pidOptions.fcount}" iCount="${pidOptions.icount}" pCount="${pidOptions.pcount}" pType="${pidOptions.ptype}" format="${pidOptions.format}" pgCount="2" timeout="${pidOptions.timeout}" posh="${pidOptions.posh}" env="NA" />
  <CustOpts>
    <Param name="wadh" value="${pidOptions.wadh}" />
    <Param name="key" value="" />
  </CustOpts>
</PidOptions>`;
    return xml;
  };

  const captureFingerprint = async () => {
    setLoading(true);
    setError(null);
    setCaptureData(null);

    try {
      const pidXml = generatePidXml();

      const response = await fetch('/api/mantra/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port: 11101,
          pidOptions: pidXml
        }),
      });

      const data = await response.json();
      onResponse(data);

      if (data.ok && data.result?.body) {
        setCaptureData(data.result);
      } else if (!data.ok) {
        setError(data.message || 'Failed to capture fingerprint');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Network error occurred while capturing fingerprint'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Fingerprint Capture</h2>

      {/* PID Options Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-800">PID Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finger Count</label>
            <select
              value={pidOptions.fcount}
              onChange={(e) => handlePidOptionChange('fcount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finger Type</label>
            <select
              value={pidOptions.ftype}
              onChange={(e) => handlePidOptionChange('ftype', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">Unknown</option>
              <option value="1">Right Thumb</option>
              <option value="2">Right Index</option>
              <option value="3">Right Middle</option>
              <option value="4">Right Ring</option>
              <option value="5">Right Little</option>
              <option value="6">Left Thumb</option>
              <option value="7">Left Index</option>
              <option value="8">Left Middle</option>
              <option value="9">Left Ring</option>
              <option value="10">Left Little</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={pidOptions.posh}
              onChange={(e) => handlePidOptionChange('posh', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="LEFT_INDEX">Left Index</option>
              <option value="LEFT_MIDDLE">Left Middle</option>
              <option value="LEFT_RING">Left Ring</option>
              <option value="LEFT_LITTLE">Left Little</option>
              <option value="LEFT_THUMB">Left Thumb</option>
              <option value="RIGHT_INDEX">Right Index</option>
              <option value="RIGHT_MIDDLE">Right Middle</option>
              <option value="RIGHT_RING">Right Ring</option>
              <option value="RIGHT_LITTLE">Right Little</option>
              <option value="RIGHT_THUMB">Right Thumb</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality Threshold</label>
            <select
              value={pidOptions.quality}
              onChange={(e) => handlePidOptionChange('quality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="30">30 (Low)</option>
              <option value="45">45 (Medium)</option>
              <option value="60">60 (High)</option>
              <option value="80">80 (Very High)</option>
              <option value="95">95 (Maximum)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
            <select
              value={pidOptions.timeout}
              onChange={(e) => handlePidOptionChange('timeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="15000">15 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={pidOptions.format}
              onChange={(e) => handlePidOptionChange('format', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">ANSI 381</option>
              <option value="1">ISO 19794</option>
            </select>
          </div>

        </div>
      </div>

      {/* Capture Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={captureFingerprint}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Capturing...
            </div>
          ) : (
            'Capture Fingerprint'
          )}
        </button>

        <div className="text-sm text-gray-600">
          Place your finger on the scanner and click capture
        </div>
      </div>

      {/* Capture Results */}
      {captureData && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Capture Results</h3>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><strong>Status:</strong> <span className="text-green-700">Success</span></p>
                <p className="text-sm"><strong>Method:</strong> {captureData.used || 'Unknown'}</p>
                <p className="text-sm"><strong>Content-Type:</strong> {captureData.headers?.['content-type'] || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm"><strong>Response Size:</strong> {captureData.body?.length || 0} bytes</p>
                <p className="text-sm"><strong>Status Code:</strong> {captureData.statusCode || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">Capture Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p><strong>Note:</strong> This captures fingerprint data using the configured options</p>
        <p>In development mode, mock fingerprint data will be returned</p>
        <p>Ensure the device is properly connected and RDService is running</p>
      </div>
    </div>
  );
};

export default FingerprintCapture;