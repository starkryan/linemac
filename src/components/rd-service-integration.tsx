'use client';

import { useState, useEffect } from 'react';

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
  const [workingHost, setWorkingHost] = useState<string>('localhost');
  const [workingProtocol, setWorkingProtocol] = useState<string>('https');

  const scanForService = async (): Promise<number> => {
    setError(null);

    for (let port = 11100; port <= 11120; port++) {
      // Try both localhost and 127.0.0.1 for each port
      const hosts = ['localhost', '127.0.0.1'];
      // Try both HTTP and HTTPS protocols
      const protocols = ['https', 'http'];

      for (const host of hosts) {
        for (const protocol of protocols) {
          try {
            const url = `${protocol}://${host}:${port}/rd/service`;

            const serviceFound = await new Promise<boolean>((resolve) => {
              const xhr = new XMLHttpRequest();
              xhr.open('RDSERVICE', url, true);

              xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    const responseText = xhr.responseText;
                    // Check for various RD service responses
                    if (responseText.includes("Morpho_RD_Service") ||
                        responseText.includes("MORPHO_RD_SERVICE") ||
                        responseText.includes("IDEMIA_L1_RDSERVICE") ||
                        responseText.includes("Mantra") ||
                        responseText.includes("MANTRA") ||
                        responseText.includes("MFS") ||
                        responseText.includes("RDService")) {
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  } else {
                    resolve(false);
                  }
                }
              };

              xhr.onerror = () => {
                resolve(false);
              };

              xhr.send();
            });

            if (serviceFound) {
              const info = await getDeviceInfo(port, host, protocol);
              if (info) {
                setDeviceInfo(info);
                setWorkingHost(host);
                setWorkingProtocol(protocol);
                return port;
              }
            }
          } catch {
            // Continue to next protocol
          }
        }
      }
    }

    setError('RD Service not found. Please ensure RD Service (Morpho/Mantra) is running.');
    return -1;
  };

  const getDeviceInfo = async (port: number, host: string = 'localhost', protocol: string = 'https'): Promise<DeviceInfo | null> => {
    try {
      const url = `${protocol}://${host}:${port}/rd/info`;

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('DEVICEINFO', url, true);
        xhr.setRequestHeader("Content-Type", "text/xml");
        xhr.setRequestHeader("Accept", "text/xml");

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const responseText = xhr.responseText;
              // Try to extract device info from response
              let deviceInfo = `Biometric Device on ${protocol}://${host}:${port}`;

              if (responseText.includes('Morpho') || responseText.includes('IDEMIA') || responseText.includes('Mantra') || responseText.includes('MFS')) {
                // Extract actual device info if available
                const infoMatch = responseText.match(/<Info[^>]*>([^<]*)<\/Info>/);
                if (infoMatch && infoMatch[1]) {
                  deviceInfo = infoMatch[1];
                }
              }

              resolve({
                status: 'success',
                err: '',
                info: deviceInfo,
                port: port.toString()
              });
            } else {
              resolve(null);
            }
          }
        };

        xhr.onerror = () => {
          resolve(null);
        };

        xhr.send();
      });
    } catch (error) {
      return null;
    }
  };

  const captureFingerprint = async (port: number, host: string = 'localhost', protocol: string = 'https'): Promise<RDServiceResponse | null> => {
    setIsScanning(true);
    setError(null);

    try {
      const url = `${protocol}://${host}:${port}/rd/capture`;

      // Try multiple PID options configurations to resolve error 730
      const pidOptionsList = [
        '<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="0" format="0" pidVer="2.0" timeout="10000" otp="" wadh="" posh=""/></PidOptions>',
        '<PidOptions ver="1.0"><Opts env="S" fCount="1" fType="2" format="0" pidVer="2.0" timeout="15000" otp="" wadh="" posh=""/></PidOptions>',
        '<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" iType="0" pCount="0" pType="0" format="0" pidVer="2.0" timeout="10000"/></PidOptions>',
        '<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" format="0" pidVer="2.0" timeout="20000"/></PidOptions>'
      ];

      // Try each configuration until one works
      for (let i = 0; i < pidOptionsList.length; i++) {
        const pidOptions = pidOptionsList[i];
        const result = await tryCaptureWithParams(url, pidOptions);
        if (result) {
          return result;
        }
      }

      setError('All capture configurations failed. Please check device connection.');
      return null;

    } catch (error) {
      setIsScanning(false);
      setError('Failed to capture fingerprint');
      return null;
    }
  };

  const tryCaptureWithParams = (url: string, pidOptions: string): Promise<RDServiceResponse | null> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('CAPTURE', url, true);
      xhr.setRequestHeader("Content-Type", "text/xml");
      xhr.setRequestHeader("Accept", "text/xml");

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const responseText = xhr.responseText;

              // Parse XML response first
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(responseText, 'text/xml');

              // Check for error codes in response
              const errorMatch = responseText.match(/errCode="([^"]*)"/);
              if (errorMatch && errorMatch[1] !== '0') {
                // Extract error info if available
                const errorInfoMatch = responseText.match(/errInfo="([^"]*)"/);
                const errorInfo = errorInfoMatch ? errorInfoMatch[1] : '';
  
                // For error 730, we'll try the next configuration
                if (errorMatch[1] === '730') {
                  resolve(null); // Try next configuration
                  return;
                }

                setError(`Capture failed with error code: ${errorMatch[1]}${errorInfo ? ` - ${errorInfo}` : ''}`);
                resolve(null);
                return;
              }

              // Extract data from XML response
              const pidData = xmlDoc.querySelector('Pid')?.getAttribute('value') ||
                            xmlDoc.querySelector('Data')?.textContent ||
                            xmlDoc.querySelector('PidData')?.textContent ||
                            responseText;

              const err = xmlDoc.querySelector('Err')?.getAttribute('value') || '';
              const status = xmlDoc.querySelector('Status')?.getAttribute('value') || 'success';
              const info = xmlDoc.querySelector('Info')?.getAttribute('value') || 'Fingerprint captured successfully';

              // For successful captures, we should have some data
              if (pidData && pidData.length > 0) {
                setIsScanning(false);
                resolve({
                  pid: pidData,
                  err,
                  status,
                  info
                });
              } else {
                setIsScanning(false);
                setError('No fingerprint data captured');
                resolve(null);
              }
            } catch (parseError) {
              setIsScanning(false);
              setError('Failed to parse device response');
              resolve(null);
            }
          } else {
            setIsScanning(false);
            setError(`Capture failed: ${xhr.statusText || xhr.status}`);
            resolve(null);
          }
        }
      };

      xhr.onerror = () => {
        setIsScanning(false);
        setError('Network error while capturing fingerprint');
        resolve(null);
      };

      xhr.send(pidOptions);
    });
  };

  return {
    scanForService,
    captureFingerprint,
    isScanning,
    deviceInfo,
    error,
    workingHost,
    workingProtocol
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
  const { scanForService, captureFingerprint, isScanning, deviceInfo, error, workingHost, workingProtocol } = useRDService();
  const [port, setPort] = useState<number | null>(null);

  // Auto-start capture when component mounts
  useEffect(() => {
    const startCapture = async () => {
      try {
        let servicePort = port;

        if (!servicePort) {
          servicePort = await scanForService();
          if (servicePort === -1) return;
          setPort(servicePort);
        }

        const result = await captureFingerprint(servicePort, workingHost, workingProtocol);
        if (result) {
          onCapture(type, result);
        }
      } catch {
        // Capture error handled silently
      }
    };

    startCapture();
  }, [port, scanForService, captureFingerprint, onCapture, type, workingHost, workingProtocol]);

  return (
    <div className="space-y-2">

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