'use client';

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MorphoConfigCheckerProps {
  onConfigCheck: (config: any) => void;
}

export function MorphoConfigChecker({ onConfigCheck }: MorphoConfigCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [rdHost] = useState('127.0.0.1');

  // Function to check Morpho configuration
  const checkMorphoConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ports = [11100, 11101, 11102, 11103, 11104, 11105];
      let workingPort = null;
      let rdServiceUrl = null;

      // Discover RDService
      for (const port of ports) {
        try {
          const response = await fetch(`http://${rdHost}:${port}/`, {
            method: 'GET',
            mode: 'no-cors',
          });
          workingPort = port;
          rdServiceUrl = `http://${rdHost}:${port}`;
          break;
        } catch (err) {
          continue;
        }
      }

      if (!rdServiceUrl) {
        throw new Error('RDService not found. Please ensure Mantra RDService is running on ports 11100-11105.');
      }

      // Check RDSERVICE
      const rdResponse = await fetch(`${rdServiceUrl}/`, {
        method: 'RDSERVICE',
        headers: {
          'Content-Type': 'text/xml',
        },
      });

      const rdText = await rdResponse.text();

      // Check DEVICEINFO
      const deviceResponse = await fetch(`${rdServiceUrl}/rd/info`, {
        method: 'DEVICEINFO',
        headers: {
          'Content-Type': 'text/xml',
        },
      });

      const deviceText = await deviceResponse.text();

      // Parse responses
      const configData = {
        rdService: parseRDServiceResponse(rdText),
        deviceInfo: parseDeviceInfoResponse(deviceText),
        workingPort,
        rdServiceUrl,
        timestamp: new Date().toISOString()
      };

      setConfigStatus(configData);
      onConfigCheck(configData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [rdHost, onConfigCheck]);

  // Parse RDService response
  const parseRDServiceResponse = (xmlText: string) => {
    const result: any = {};

    try {
      const rdServiceMatch = xmlText.match(/<RDService[^>]*\/>/) || xmlText.match(/<RDService[^>]*>([\s\S]*?)<\/RDService>/);
      if (rdServiceMatch) {
        const attrMatches = rdServiceMatch[0].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match) {
              result[match[1]] = match[2];
            }
          });
        }
      }
    } catch (err) {
      console.error('Error parsing RDService response:', err);
    }

    return result;
  };

  // Parse DeviceInfo response
  const parseDeviceInfoResponse = (xmlText: string) => {
    const result: any = {};

    try {
      const deviceInfoMatch = xmlText.match(/<DeviceInfo[^>]*>([\s\S]*?)<\/DeviceInfo>/);
      if (deviceInfoMatch) {
        const attrMatches = deviceInfoMatch[0].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match && match[1] !== 'additional_info') {
              result[match[1]] = match[2];
            }
          });
        }
      }
    } catch (err) {
      console.error('Error parsing DeviceInfo response:', err);
    }

    return result;
  };

  const getConfigStatus = () => {
    if (!configStatus) return null;

    const { rdService, deviceInfo } = configStatus;

    // Check if it's Morpho compatible
    const isMorphoCompatible = rdService?.ver === '2.0' || deviceInfo?.dpId?.startsWith('M');
    const hasRequiredParams = rdService?.mi && deviceInfo?.mc;

    return {
      isMorphoCompatible,
      hasRequiredParams,
      overall: isMorphoCompatible && hasRequiredParams ? 'good' :
               isMorphoCompatible || hasRequiredParams ? 'fair' : 'poor'
    };
  };

  const status = getConfigStatus();

  return (
    <div className="space-y-4">
      {/* Config Check Button */}
      <div className="text-center">
        <Button
          onClick={checkMorphoConfig}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? 'Checking Configuration...' : 'Check Morpho Configuration'}
        </Button>
      </div>

      {/* Configuration Status */}
      {configStatus && (
        <Card className={`border-2 ${
          status?.overall === 'good' ? 'border-green-200 bg-green-50' :
          status?.overall === 'fair' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${
              status?.overall === 'good' ? 'text-green-800' :
              status?.overall === 'fair' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              📊 Morpho Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  status?.overall === 'good' ? 'bg-green-100 text-green-800' :
                  status?.overall === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status?.overall === 'good' ? '✅ Excellent Configuration' :
                   status?.overall === 'fair' ? '⚠️ Acceptable Configuration' :
                   '❌ Configuration Issues'}
                </div>
              </div>

              {/* Detailed Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-gray-700">RDService Info:</div>
                  <div className="space-y-1 text-xs">
                    {Object.entries(configStatus.rdService || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-gray-700">Device Info:</div>
                  <div className="space-y-1 text-xs">
                    {Object.entries(configStatus.deviceInfo || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compatibility Checks */}
              <div className="border-t pt-3">
                <div className="font-medium text-gray-700 mb-2">Compatibility Checks:</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Morpho Compatible:</span>
                    <span className={`px-2 py-1 rounded ${
                      status?.isMorphoCompatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status?.isMorphoCompatible ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Required Parameters:</span>
                    <span className={`px-2 py-1 rounded ${
                      status?.hasRequiredParams ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status?.hasRequiredParams ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Working Port:</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {configStatus.workingPort}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-2">Recommendations:</div>
                <div className="text-xs text-gray-600 space-y-1">
                  {status?.overall === 'good' && (
                    <div>✅ Configuration is optimal for fingerprint capture</div>
                  )}
                  {status?.overall === 'fair' && (
                    <div>⚠️ Configuration may work but could be improved</div>
                  )}
                  {status?.overall === 'poor' && (
                    <div>❌ Configuration needs attention before use</div>
                  )}
                  {!status?.isMorphoCompatible && (
                    <div>• Consider updating to Morpho-compatible RDService</div>
                  )}
                  {!status?.hasRequiredParams && (
                    <div>• Check device configuration and required parameters</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="text-red-700 text-sm">
              <div className="font-medium mb-1">⚠️ Configuration Check Failed</div>
              {error}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}