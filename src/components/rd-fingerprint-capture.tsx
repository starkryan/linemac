'use client';

import React, { useState, useEffect } from 'react';
import { RDService, RDServiceConfig, CaptureResponse } from '@/lib/rd-service';
import { Loader2, Camera, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface RDFingerprintCaptureProps {
  captureType: 'left' | 'right' | 'thumbs';
  title: string;
  fingerCount?: string;
  onCaptureComplete: (data: CaptureResponse) => void;
}

export function RDFingerprintCapture({
  captureType,
  title,
  fingerCount = '1',
  onCaptureComplete
}: RDFingerprintCaptureProps) {
  const [rdService] = useState(() => new RDService());
  const [deviceStatus, setDeviceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<CaptureResponse | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rdServiceInfo, setRdServiceInfo] = useState<string>('');

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    try {
      setDeviceStatus('checking');
      setError(null);

      // First check if RD Service is available
      const isAvailable = await rdService.checkRDService();

      if (isAvailable) {
        setDeviceStatus('connected');
        setRdServiceInfo('RD Service Found');

        // Try to get device info
        try {
          const info = await rdService.getDeviceInfo();
          setDeviceInfo(info);
        } catch (deviceError) {
          console.log('Device info not available, but service is connected');
        }
      } else {
        setDeviceStatus('disconnected');
        setError('RD Service not available');
        setRdServiceInfo('RD Service Not Found');
      }
    } catch (err) {
      setDeviceStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRdServiceInfo('RD Service Error');
    }
  };

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      setCaptureResult(null);

      // Map capture type to fType parameter
      const fType = captureType === 'left' ? '0' :
                   captureType === 'right' ? '1' : '2';

      const result = await rdService.captureFingerprint({
        fCount: fingerCount,
        fType: fType
      });

      setCaptureResult(result);
      onCaptureComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Capture failed');
      setCaptureResult(null);
    } finally {
      setIsCapturing(false);
    }
  };

  const getStatusColor = () => {
    switch (deviceStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = () => {
    switch (deviceStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getCaptureStatusIcon = () => {
    if (!captureResult) return null;
    return captureResult.status === 'SUCCESS'
      ? <CheckCircle className="w-5 h-5 text-green-600" />
      : <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2">
            {deviceStatus === 'checking' ? 'Checking RD Service...' :
             deviceStatus === 'connected' ? 'RD Service Connected' : 'RD Service Disconnected'}
          </span>
        </div>
      </div>

      {/* RD Service Status */}
      {rdServiceInfo && (
        <div className="text-sm text-gray-600">
          Status: {rdServiceInfo}
        </div>
      )}

      {/* Device Info */}
      {deviceInfo && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div><strong>Device:</strong> {deviceInfo.dpId}</div>
            <div><strong>RDS ID:</strong> {deviceInfo.rdsId}</div>
            <div><strong>Version:</strong> {deviceInfo.rdsVer}</div>
            <div><strong>Model:</strong> {deviceInfo.mc}</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">RD Service Error:</div>
              <div className="whitespace-pre-line">{error}</div>
              <div className="mt-2 text-xs text-red-600">
                Troubleshooting:
                <ul className="list-disc ml-4 mt-1">
                  <li>Ensure RD Service is running on port 11100</li>
                  <li>Check if Morpho device is connected</li>
                  <li>Try running from localhost (not IP address)</li>
                  <li>Check browser console for more details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Capture Area */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-300">
            <Camera className="w-16 h-16 text-gray-400" />

            {isCapturing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Capturing...</p>
                </div>
              </div>
            )}
          </div>

          {captureResult && (
            <div className="absolute -top-2 -right-2">
              {getCaptureStatusIcon()}
            </div>
          )}
        </div>
      </div>

      {/* Capture Result */}
      {captureResult && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${
                captureResult.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
              }`}>
                {captureResult.status}
              </span>
            </div>
            {captureResult.score !== undefined && (
              <div>
                <span className="text-gray-600">Quality Score:</span>
                <span className={`ml-2 font-medium ${
                  captureResult.score >= 60 ? 'text-green-600' :
                  captureResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {captureResult.score}/100
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Capture Button */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleCapture}
          disabled={deviceStatus !== 'connected' || isCapturing}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            deviceStatus === 'connected' && !isCapturing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isCapturing ? (
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Capturing...
            </div>
          ) : (
            'Capture Fingerprint'
          )}
        </button>

        <button
          onClick={initializeDevice}
          disabled={isCapturing}
          className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>

      {/* Retry Connection */}
      {deviceStatus === 'disconnected' && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Please ensure RD Service is running on port 11100
          </p>
        </div>
      )}
    </div>
  );
}