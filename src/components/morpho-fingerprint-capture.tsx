'use client';

import React, { useState, useEffect } from 'react';
import { MorphoService, MorphoCaptureResponse, MorphoDeviceInfo } from '@/lib/morpho-service';
import { RDServiceLoader } from '@/components/rd-service-loader';
import { Loader2, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MorphoFingerprintCaptureProps {
  captureType: 'left' | 'right' | 'thumbs';
  title: string;
  onCaptureComplete: (data: MorphoCaptureResponse) => void;
}

export function MorphoFingerprintCapture({
  captureType,
  title,
  onCaptureComplete
}: MorphoFingerprintCaptureProps) {
  const [morphoService] = useState(() => new MorphoService());
  const [deviceStatus, setDeviceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<MorphoCaptureResponse | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<MorphoDeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rdServiceLoaded, setRdServiceLoaded] = useState(false);

  useEffect(() => {
    if (rdServiceLoaded) {
      initializeDevice();
    }
  }, [rdServiceLoaded]);

  useEffect(() => {
    return () => {
      morphoService.disconnect();
    };
  }, []);

  const initializeDevice = async () => {
    try {
      setDeviceStatus('checking');
      setError(null);

      const isInitialized = await morphoService.initializeDevice();
      if (isInitialized) {
        setDeviceStatus('connected');
        const info = morphoService.getDeviceInfoStatus();
        setDeviceInfo(info);
      } else {
        setDeviceStatus('disconnected');
        setError('Device not found or initialization failed');
      }
    } catch (err) {
      setDeviceStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      setCaptureResult(null);

      const result = await morphoService.captureFingerprint(captureType);
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
            {deviceStatus === 'checking' ? 'Checking Device...' :
             deviceStatus === 'connected' ? 'Device Connected' : 'Device Disconnected'}
          </span>
        </div>
      </div>

      {!rdServiceLoaded && (
        <RDServiceLoader onServiceLoaded={setRdServiceLoaded} />
      )}

      {rdServiceLoaded && (
        <>
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-300">
                {captureResult?.base64Image ? (
                  <img
                    src={captureResult.base64Image}
                    alt="Captured fingerprint"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="w-16 h-16 text-gray-400" />
                )}

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
                <div>
                  <span className="text-gray-600">Quality Score:</span>
                  <span className={`ml-2 font-medium ${
                    captureResult.score >= 60 ? 'text-green-600' :
                    captureResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {captureResult.score}/100
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
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
          </div>

          {deviceStatus === 'disconnected' && (
            <div className="text-center">
              <button
                onClick={initializeDevice}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Retry Device Connection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}