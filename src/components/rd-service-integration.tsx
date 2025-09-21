'use client';

import { useState } from 'react';

interface RDServiceResponse {
  pid: string;
  err: string;
  status: string;
  info: string;
}

interface DeviceInfo {
  status: string;
  err: string;
  info: string;
  port: string;
}

export const useRDService = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanForService = async (): Promise<number> => {
    setError(null);

    for (let port = 11100; port <= 11120; port++) {
      try {
        const url = `https://localhost:${port}/rd/service`;
        const response = await fetch(url, {
          method: 'RDSERVICE',
          mode: 'no-cors'
        });

        if (response.ok || response.type === 'opaque') {
          const info = await getDeviceInfo(port);
          if (info) {
            setDeviceInfo(info);
            return port;
          }
        }
      } catch {
        // Continue to next port
      }
    }

    setError('RD Service not found. Please ensure Morpho RD Service is running.');
    return -1;
  };

  const getDeviceInfo = async (port: number): Promise<DeviceInfo | null> => {
    try {
      const url = `https://localhost:${port}/rd/info`;
      const response = await fetch(url, {
        method: 'DEVICEINFO',
        mode: 'no-cors'
      });

      if (response.ok || response.type === 'opaque') {
        return {
          status: 'success',
          err: '',
          info: `Morpho Device on port ${port}`,
          port: port.toString()
        };
      }
    } catch {
      // Handle error
    }

    return null;
  };

  const captureFingerprint = async (port: number): Promise<RDServiceResponse | null> => {
    setIsScanning(true);
    setError(null);

    try {
      const url = `https://localhost:${port}/rd/capture`;

      // Using XMLHttpRequest for custom HTTP methods
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('CAPTURE', url, true);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            setIsScanning(false);

            if (xhr.status === 200) {
              try {
                // Parse XML response
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');

                const pid = xmlDoc.querySelector('Pid')?.getAttribute('value') || '';
                const err = xmlDoc.querySelector('Err')?.getAttribute('value') || '';
                const status = xmlDoc.querySelector('Status')?.getAttribute('value') || '';
                const info = xmlDoc.querySelector('Info')?.getAttribute('value') || '';

                resolve({ pid, err, status, info });
              } catch {
                setError('Failed to parse device response');
                resolve(null);
              }
            } else {
              setError(`Capture failed: ${xhr.statusText}`);
              resolve(null);
            }
          }
        };

        xhr.onerror = () => {
          setIsScanning(false);
          setError('Network error while capturing fingerprint');
          resolve(null);
        };

        xhr.send();
      });
    } catch {
      setIsScanning(false);
      setError('Failed to capture fingerprint');
      return null;
    }
  };

  return {
    scanForService,
    captureFingerprint,
    isScanning,
    deviceInfo,
    error
  };
};

interface RDServiceIntegrationProps {
  onCapture: (type: 'left' | 'right' | 'thumbs', data: RDServiceResponse) => void;
  type: 'left' | 'right' | 'thumbs';
  label: string;
}

export const RDServiceIntegration: React.FC<RDServiceIntegrationProps> = ({
  onCapture,
  type,
  label
}) => {
  const { scanForService, captureFingerprint, isScanning, deviceInfo, error } = useRDService();
  const [port, setPort] = useState<number | null>(null);

  const handleCapture = async () => {
    try {
      let servicePort = port;

      if (!servicePort) {
        servicePort = await scanForService();
        if (servicePort === -1) return;
        setPort(servicePort);
      }

      const result = await captureFingerprint(servicePort);
      if (result) {
        onCapture(type, result);
      }
    } catch {
      console.error('Capture error');
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCapture}
        disabled={isScanning}
        className={`p-2 rounded-lg border transition-colors ${
          isScanning
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 ${isScanning ? 'animate-pulse' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </button>

      {deviceInfo && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          Device: {deviceInfo.info}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {isScanning && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Scanning fingerprint...
        </div>
      )}
    </div>
  );
};