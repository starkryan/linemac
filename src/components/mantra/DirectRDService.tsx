'use client';

import React, { useState } from 'react';

interface DirectRDServiceProps {
  onResponse: (response: any) => void;
}

const DirectRDService: React.FC<DirectRDServiceProps> = ({ onResponse }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null);
  const [rdHost, setRdHost] = useState('192.168.1.8');
  const [captureOptions, setCaptureOptions] = useState(
    '<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>'
  );

  // Function to scan ports and find RDService
  const discoverRDService = async (): Promise<string | null> => {
    const ports = [11100, 11101, 11102, 11103, 11104, 11105];

    for (const port of ports) {
      try {
        const response = await fetch(`http://${rdHost}:${port}/`, {
          method: 'GET',
          mode: 'no-cors',
        });

        // If we get here, the port is accessible
        return `http://${rdHost}:${port}`;
      } catch (err) {
        // Port not accessible, try next one
        continue;
      }
    }
    return null;
  };

  // Function to make RDService requests with proper HTTP verbs (following Morpho patterns)
  const makeRDServiceRequest = async (endpoint: string, method = 'GET', body?: string): Promise<any> => {
    try {
      const rdServiceUrl = await discoverRDService();
      if (!rdServiceUrl) {
        throw new Error('RDService not found. Please ensure Mantra RDService is running.');
      }

      const url = `${rdServiceUrl}${endpoint}`;

      // For RDService verbs, use the method directly as the HTTP method
      const options: RequestInit = {
        method: method,
        headers: {
          'Content-Type': 'text/xml',
        },
      };

      if (body) {
        options.body = body;
      }

      console.log(`Making ${method} request to ${url}`);

      const response = await fetch(url, options);
      const xmlText = await response.text();

      console.log(`Response status: ${response.status}`);
      console.log(`Response body: ${xmlText.substring(0, 200)}...`);

      return {
        ok: true,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: xmlText,
      };
    } catch (err) {
      console.error(`RDService request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw new Error(`RDService request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Function to parse XML response
  const parseXMLResponse = (xmlText: string): any => {
    try {
      const result: any = {};

      // Parse RDService response
      const rdServiceMatch = xmlText.match(/<RDService[^>]*>([\s\S]*?)<\/RDService>/);
      if (rdServiceMatch) {
        result.rdService = {};
        // Extract attributes
        const attrMatches = rdServiceMatch[0].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match) {
              result.rdService[match[1]] = match[2];
            }
          });
        }

        // Parse Interface elements
        const interfaceMatches = rdServiceMatch[1].match(/<Interface[^>]*\/>/g);
        if (interfaceMatches) {
          result.rdService.interfaces = [];
          interfaceMatches.forEach(iface => {
            const ifaceData: any = {};
            const ifaceAttrs = iface.match(/(\w+)="([^"]*)"/g);
            if (ifaceAttrs) {
              ifaceAttrs.forEach(attr => {
                const match = attr.match(/(\w+)="([^"]*)"/);
                if (match) {
                  ifaceData[match[1]] = match[2];
                }
              });
            }
            result.rdService.interfaces.push(ifaceData);
          });
        }
      }

      // Parse DeviceInfo
      const deviceInfoMatch = xmlText.match(/<DeviceInfo[^>]*>([\s\S]*?)<\/DeviceInfo>/);
      if (deviceInfoMatch) {
        result.deviceInfo = {};
        // Extract attributes from DeviceInfo tag
        const attrMatches = deviceInfoMatch[0].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match && match[1] !== 'additional_info') {
              result.deviceInfo[match[1]] = match[2];
            }
          });
        }

        // Parse additional_info Params
        const additionalInfoMatch = deviceInfoMatch[1].match(/<additional_info>([\s\S]*?)<\/additional_info>/);
        if (additionalInfoMatch) {
          result.deviceInfo.additional_info = {};
          const paramMatches = additionalInfoMatch[1].match(/<Param name="([^"]*)" value="([^"]*)"/g);
          if (paramMatches) {
            paramMatches.forEach(param => {
              const match = param.match(/<Param name="([^"]*)" value="([^"]*)"/);
              if (match) {
                result.deviceInfo.additional_info[match[1]] = match[2];
              }
            });
          }
        }
      }

      // Parse PidData response
      const pidDataMatch = xmlText.match(/<PidData[^>]*>([\s\S]*?)<\/PidData>/);
      if (pidDataMatch) {
        result.pidData = {};

        // Parse Resp element
        const respMatch = pidDataMatch[1].match(/<Resp[^>]*\/>/);
        if (respMatch) {
          result.pidData.resp = {};
          const attrMatches = respMatch[0].match(/(\w+)="([^"]*)"/g);
          if (attrMatches) {
            attrMatches.forEach(attr => {
              const match = attr.match(/(\w+)="([^"]*)"/);
              if (match) {
                result.pidData.resp[match[1]] = match[2];
              }
            });
          }
        }

        // Parse DeviceInfo inside PidData
        const innerDeviceInfoMatch = pidDataMatch[1].match(/<DeviceInfo[^>]*>([\s\S]*?)<\/DeviceInfo>/);
        if (innerDeviceInfoMatch) {
          result.pidData.deviceInfo = {};
          const attrMatches = innerDeviceInfoMatch[0].match(/(\w+)="([^"]*)"/g);
          if (attrMatches) {
            attrMatches.forEach(attr => {
              const match = attr.match(/(\w+)="([^"]*)"/);
              if (match) {
                result.pidData.deviceInfo[match[1]] = match[2];
              }
            });
          }
        }
      }

      return result;
    } catch (err) {
      return { error: `Failed to parse XML: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  };

  // Discover device (RDSERVICE) - following Morpho patterns
  const handleDiscover = async () => {
    setLoading(true);
    setError(null);

    try {
      const rdServiceUrl = await discoverRDService();
      if (!rdServiceUrl) {
        throw new Error('RDService not found. Please ensure Mantra RDService is running on ports 11100-11105.');
      }

      console.log(`Found RDService at: ${rdServiceUrl}`);

      // Try RDSERVICE request using Morpho pattern
      const response = await makeRDServiceRequest('/', 'RDSERVICE');
      const parsed = parseXMLResponse(response.body);

      console.log('RDSERVICE Response:', parsed);

      setDeviceInfo(parsed.rdService || {});
      setLastRawResponse(response.body);

      onResponse({
        ok: true,
        method: 'RDSERVICE',
        result: {
          ...response,
          parsed,
        },
        message: `RDService found at ${rdServiceUrl}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Discover error:', errorMessage);
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Failed to discover RDService',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get device info (DEVICEINFO) - following Morpho patterns
  const handleGetDeviceInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Getting device info...');
      const response = await makeRDServiceRequest('/rd/info', 'DEVICEINFO');
      const parsed = parseXMLResponse(response.body);

      console.log('DEVICEINFO Response:', parsed);

      setDeviceInfo(parsed.deviceInfo || {});
      setLastRawResponse(response.body);

      onResponse({
        ok: true,
        method: 'DEVICEINFO',
        result: {
          ...response,
          parsed,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('DeviceInfo error:', errorMessage);
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Failed to get device info',
      });
    } finally {
      setLoading(false);
    }
  };

  // Capture fingerprint (CAPTURE) - following Morpho patterns
  const handleCapture = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Capturing fingerprint...');
      console.log('PID Options:', captureOptions);

      const response = await makeRDServiceRequest('/rd/capture', 'CAPTURE', captureOptions);
      const parsed = parseXMLResponse(response.body);

      console.log('CAPTURE Response:', parsed);
      setLastRawResponse(response.body);

      onResponse({
        ok: true,
        method: 'CAPTURE',
        result: {
          ...response,
          parsed,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Capture error:', errorMessage);
      setError(errorMessage);
      onResponse({
        ok: false,
        error: errorMessage,
        message: 'Failed to capture fingerprint',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Mantra RDService Test Interface</h2>
      <p className="text-sm text-gray-600 mb-4">
        Communicates directly with your local Mantra RDService (following Morpho patterns)
      </p>

      {/* RDService Host Configuration */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          RDService Host IP
        </label>
        <input
          type="text"
          value={rdHost}
          onChange={(e) => setRdHost(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono"
          placeholder="192.168.1.8 or 127.0.0.1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use 127.0.0.1 if RDService runs on same machine, or use the Windows machine IP (e.g., 192.168.1.8)
        </p>
        <p className="text-xs text-blue-600 mt-1 font-medium">
          ✅ Use v2.0 PID Options for successful capture (based on working test page)
        </p>
      </div>

      {/* Capture Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capture Options (XML)
        </label>
        <textarea
          value={captureOptions}
          onChange={(e) => setCaptureOptions(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono"
          rows={3}
          placeholder="Enter PID options XML..."
        />
        <div className="mt-2 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Test Different PID Options Formats:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-green-200 text-green-700 rounded text-sm hover:bg-green-300 transition-colors"
            >
              ✅ Working AVDM Format
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="1.0" env="P"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="1.0" timeout="10000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Standard v1.0
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="P"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              fType=2
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="30000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-purple-200 text-purple-700 rounded text-sm hover:bg-purple-300 transition-colors"
            >
              Timeout 30s
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="P"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="15000" posh="UNKNOWN" wadh="E0jzJ/P8UOPUJbKldMrzoBZ2+gMU1Xw8LfZO5s6zW8s=" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-purple-200 text-purple-700 rounded text-sm hover:bg-purple-300 transition-colors"
            >
              With Wadh
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="P"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" /><CustOpts /></PidOptions>')}
              className="px-3 py-1 bg-purple-200 text-purple-700 rounded text-sm hover:bg-purple-300 transition-colors"
            >
              No MantraKey
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="T"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-green-200 text-green-700 rounded text-sm hover:bg-green-300 transition-colors"
            >
              env=T (Test)
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="P"><Opts fCount="1" fType="0" iCount="0" pCount="0" format="1" pidVer="2.0" timeout="10000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-green-200 text-green-700 rounded text-sm hover:bg-green-300 transition-colors"
            >
              format=1
            </button>
            <button
              onClick={() => setCaptureOptions('<PidOptions ver="2.0" env="P"><Opts fCount="2" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>')}
              className="px-3 py-1 bg-green-200 text-green-700 rounded text-sm hover:bg-green-300 transition-colors"
            >
              fCount=2
            </button>
          </div>
        </div>
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">✅ Working Format Found:</div>
          <div className="text-xs text-green-700">
            The <strong>Working AVDM Format</strong> button uses the exact PID options that work with your device.
            This should produce <code className="bg-green-100 px-1 rounded">errCode="0"</code> in the response.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleDiscover}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Discovering...' : 'Discover Device'}
        </button>

        <button
          onClick={handleGetDeviceInfo}
          disabled={loading || !deviceInfo}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Getting Info...' : 'Get Device Info'}
        </button>

        <button
          onClick={handleCapture}
          disabled={loading || !deviceInfo}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Capturing...' : 'Capture Fingerprint'}
        </button>
      </div>

      {/* Device Info Display */}
      {deviceInfo && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Device Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {Object.entries(deviceInfo).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Raw Response Display */}
      {lastRawResponse && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Raw XML Response</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-auto max-h-40">
              {lastRawResponse}
            </pre>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>How this works:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Scans ports 11100-11105 for RDService</li>
          <li>Communicates directly with your local RDService</li>
          <li>Works regardless of where the app is hosted</li>
          <li>No server-to-server communication required</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectRDService;