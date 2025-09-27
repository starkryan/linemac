'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Camera, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface MantraDeviceInfo {
  dpId: string;
  rdsId: string;
  rdsVer: string;
  mc: string;
  mi: string;
  additionalInfo?: string;
}

interface MantraCaptureResponse {
  status: 'SUCCESS' | 'FAILED';
  score: number;
  pid?: string;
  base64Image?: string;
  errCode?: string;
  errInfo?: string;
  qScore?: number;
}

interface MantraFingerprintCaptureProps {
  captureType: 'left' | 'right' | 'thumbs';
  title: string;
  onCaptureComplete: (data: MantraCaptureResponse) => void;
  proxyUrl?: string;
}

export function MantraFingerprintCapture({
  captureType,
  title,
  onCaptureComplete,
  proxyUrl = 'http://127.0.0.1:3000'
}: MantraFingerprintCaptureProps) {
  const [deviceStatus, setDeviceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<MantraCaptureResponse | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<MantraDeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [workingProxyUrl, setWorkingProxyUrl] = useState<string>(proxyUrl);

  useEffect(() => {
    checkProxyStatus();
    checkDeviceConnection();
  }, []);

  const checkProxyStatus = async () => {
    // Try multiple proxy URLs to find the working one
    const proxyUrls = [
      proxyUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    for (const url of proxyUrls) {
      try {
        const response = await fetch(`${url}/api/discover`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setProxyStatus('online');
            setWorkingProxyUrl(url);
            return;
          }
        }
      } catch {
        // Continue to next URL
      }
    }

    setProxyStatus('offline');
  };

  const checkDeviceConnection = async () => {
    try {
      setDeviceStatus('checking');
      setError(null);

      // Check if proxy is online first
      const currentProxyStatus = proxyStatus;
      if (currentProxyStatus !== 'online') {
        await checkProxyStatus();
        if (proxyStatus !== 'online') {
          setDeviceStatus('disconnected');
          setError('Mantra proxy server is not running');
          return;
        }
      }

      // Try to discover device using the working proxy URL
      const response = await fetch(`${workingProxyUrl}/api/discover`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.result?.body) {
          // Parse device info from XML response
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.result.body, 'text/xml');

          const info: MantraDeviceInfo = {
            dpId: xmlDoc.querySelector('DPID')?.textContent || 'Unknown',
            rdsId: xmlDoc.querySelector('RDSID')?.textContent || 'Unknown',
            rdsVer: xmlDoc.querySelector('RDSVER')?.textContent || 'Unknown',
            mc: xmlDoc.querySelector('MC')?.textContent || 'MFS110',
            mi: xmlDoc.querySelector('MI')?.textContent || 'Unknown',
            additionalInfo: `Port: ${data.port}`
          };

          setDeviceInfo(info);
          setDeviceStatus('connected');
          return;
        }
      }

      setDeviceStatus('disconnected');
      setError('Mantra device not found or not connected');
    } catch (err) {
      setDeviceStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Failed to connect to Mantra device');
    }
  };

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      setCaptureResult(null);

      // Show confirmation dialog like the real implementation
      if (!window.confirm('Place finger on sensor and click OK to start capture')) {
        setIsCapturing(false);
        return;
      }

      // Generate PID options based on capture type
      const pidOptions = generatePidOptions(captureType);

      const response = await fetch(`${workingProxyUrl}/api/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port: 11101, // Default Mantra port
          pidOptions
        })
      });

      if (!response.ok) {
        throw new Error(`Capture failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok && data.raw?.body) {
        const xml = data.raw.body;

        // Parse XML response exactly like the real implementation
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const resp = doc.querySelector('Resp');

        let respCode = 'unknown';
        let qScore = null;
        let capturedPid = null;

        if (resp) {
          respCode = resp.getAttribute('errCode') || 'unknown';
          qScore = resp.getAttribute('qScore');

          // Extract PID data if available
          const dataNode = doc.querySelector('Data');
          if (dataNode && dataNode.textContent && dataNode.textContent.trim().length) {
            capturedPid = dataNode.textContent;
          }
        }

        const result: MantraCaptureResponse = {
          status: respCode === '0' ? 'SUCCESS' : 'FAILED',
          score: qScore ? parseInt(qScore) : 0,
          errCode: respCode,
          errInfo: resp?.getAttribute('errInfo') || 'Unknown error',
          qScore: qScore ? parseInt(qScore) : undefined,
          pid: capturedPid || undefined
        };

        setCaptureResult(result);
        onCaptureComplete(result);
      } else {
        throw new Error(data.error || 'Capture failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Capture failed');
      setCaptureResult(null);
    } finally {
      setIsCapturing(false);
    }
  };

  const generatePidOptions = (type: 'left' | 'right' | 'thumbs'): string => {
    const baseOptions = '<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>';

    // Modify based on capture type
    if (type === 'thumbs') {
      return baseOptions.replace('fCount="1"', 'fCount="2"');
    }

    return baseOptions;
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

  const getProxyStatusIcon = () => {
    switch (proxyStatus) {
      case 'online': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-600" />;
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
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            proxyStatus === 'online' ? 'bg-green-100 text-green-800' :
            proxyStatus === 'offline' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {getProxyStatusIcon()}
            <span className="ml-1">Proxy</span>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2">
              {deviceStatus === 'checking' ? 'Checking Device...' :
               deviceStatus === 'connected' ? 'Device Connected' : 'Device Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {deviceInfo && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div><strong>Device:</strong> {deviceInfo.mc}</div>
            <div><strong>RDS ID:</strong> {deviceInfo.rdsId}</div>
            <div><strong>Version:</strong> {deviceInfo.rdsVer}</div>
            <div><strong>DP ID:</strong> {deviceInfo.dpId}</div>
          </div>
          {deviceInfo.additionalInfo && (
            <div className="text-xs text-gray-500 mt-1">
              {deviceInfo.additionalInfo}
            </div>
          )}
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
                  <p className="text-xs opacity-75 mt-1">Place finger on sensor</p>
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
            {captureResult.errCode && captureResult.errCode !== '0' && (
              <div className="col-span-2">
                <span className="text-gray-600">Error:</span>
                <span className="ml-2 font-medium text-red-600">
                  {captureResult.errCode} - {captureResult.errInfo}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={handleCapture}
          disabled={deviceStatus !== 'connected' || isCapturing || proxyStatus !== 'online'}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            deviceStatus === 'connected' && !isCapturing && proxyStatus === 'online'
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

        {(deviceStatus === 'disconnected' || proxyStatus === 'offline') && (
          <button
            onClick={checkDeviceConnection}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Retry Connection
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Ensure Mantra RD Service is running and device is connected</p>
        <p>Working Proxy: {workingProxyUrl}</p>
      </div>
    </div>
  );
}