'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AadhaarMantraCaptureProps {
  captureType: 'left' | 'right' | 'thumbs';
  title: string;
  onCaptureComplete: (data: { quality: number; timestamp: string; data: string; qScore?: number; nmPoints?: string; }) => void;
  autoStart?: boolean;
}

export function AadhaarMantraCapture({
  captureType,
  title,
  onCaptureComplete,
  autoStart = false
}: AadhaarMantraCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [rdHost] = useState('127.0.0.1');
  const [captureSuccess, setCaptureSuccess] = useState(false);

  // Function to scan ports and find RDService
  const discoverRDService = useCallback(async (): Promise<string | null> => {
    const ports = [11100, 11101, 11102, 11103, 11104, 11105];

    for (const port of ports) {
      try {
        const response = await fetch(`http://${rdHost}:${port}/`, {
          method: 'GET',
          mode: 'no-cors',
        });
        return `http://${rdHost}:${port}`;
      } catch (err) {
        continue;
      }
    }
    return null;
  }, [rdHost]);

  // Function to make RDService requests
  const makeRDServiceRequest = useCallback(async (endpoint: string, method = 'GET', body?: string): Promise<any> => {
    try {
      const rdServiceUrl = await discoverRDService();
      if (!rdServiceUrl) {
        throw new Error('RDService not found. Please ensure Mantra RDService is running.');
      }

      const url = `${rdServiceUrl}${endpoint}`;
      const options: RequestInit = {
        method: method,
        headers: {
          'Content-Type': 'text/xml',
        },
      };

      if (body) {
        options.body = body;
      }

      const response = await fetch(url, options);
      const xmlText = await response.text();

      return {
        ok: true,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: xmlText,
      };
    } catch (err) {
      throw new Error(`RDService request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [discoverRDService]);

  // Function to parse XML response
  const parseXMLResponse = useCallback((xmlText: string): any => {
    try {
      const result: any = {};

      // Parse RDService response (both self-closing and regular tags)
      const rdServiceMatch = xmlText.match(/<RDService[^>]*\/>/) || xmlText.match(/<RDService[^>]*>([\s\S]*?)<\/RDService>/);
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
      }

      // Parse DeviceInfo
      const deviceInfoMatch = xmlText.match(/<DeviceInfo[^>]*>([\s\S]*?)<\/DeviceInfo>/);
      if (deviceInfoMatch) {
        result.deviceInfo = {};
        const attrMatches = deviceInfoMatch[0].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match && match[1] !== 'additional_info') {
              result.deviceInfo[match[1]] = match[2];
            }
          });
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

        // Extract Data element
        const dataMatch = pidDataMatch[1].match(/<Data[^>]*>([\s\S]*?)<\/Data>/);
        if (dataMatch) {
          result.pidData.data = dataMatch[1];
        }
      }

      return result;
    } catch (err) {
      return { error: `Failed to parse XML: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  }, []);

  
  // Capture fingerprint
  const handleCapture = async () => {
    setLoading(true);
    setError(null);
    setCaptureSuccess(false);

    try {
      // Use the working AVDM PID options format
      const captureOptions = '<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>';

      const response = await makeRDServiceRequest('/rd/capture', 'CAPTURE', captureOptions);
      const parsed = parseXMLResponse(response.body);

      setLastResponse(response);

      // Check if capture was successful
      if (parsed.pidData && parsed.pidData.resp && parsed.pidData.resp.errCode === '0') {
        setCaptureSuccess(true);

        const captureData = {
          quality: parseInt(parsed.pidData.resp.qScore) || 0,
          timestamp: new Date().toISOString(),
          data: parsed.pidData.data || '',
          qScore: parseInt(parsed.pidData.resp.qScore) || 0,
          nmPoints: parsed.pidData.resp.nmPoints || '0'
        };

        onCaptureComplete(captureData);
      } else {
        const errorMessage = parsed.pidData?.resp?.errInfo || 'Capture failed';
        setError(errorMessage);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Complete workflow: Discover + Capture
  const handleCompleteCapture = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCaptureSuccess(false);

    try {
      // Step 1: Discover device
      const rdServiceUrl = await discoverRDService();
      if (!rdServiceUrl) {
        throw new Error('RDService not found. Please ensure Mantra RDService is running on ports 11100-11105.');
      }

      const discoverResponse = await makeRDServiceRequest('/', 'RDSERVICE');
      const discoverParsed = parseXMLResponse(discoverResponse.body);

      // Store device info
      setDeviceInfo({
        ...(discoverParsed.deviceInfo || {}),
        ...(discoverParsed.rdService || {})
      });
      setLastResponse(discoverResponse);

      // Step 2: Capture fingerprint
      const captureOptions = '<PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /><CustOpts><Param name="mantrakey" value="" /></CustOpts></PidOptions>';

      const captureResponse = await makeRDServiceRequest('/rd/capture', 'CAPTURE', captureOptions);
      const captureParsed = parseXMLResponse(captureResponse.body);

      setLastResponse(captureResponse);

      // Check if capture was successful
      if (captureParsed.pidData && captureParsed.pidData.resp && captureParsed.pidData.resp.errCode === '0') {
        setCaptureSuccess(true);

        const captureData = {
          quality: parseInt(captureParsed.pidData.resp.qScore) || 0,
          timestamp: new Date().toISOString(),
          data: captureParsed.pidData.data || '',
          qScore: parseInt(captureParsed.pidData.resp.qScore) || 0,
          nmPoints: captureParsed.pidData.resp.nmPoints || '0'
        };

        onCaptureComplete(captureData);
      } else {
        const errorMessage = captureParsed.pidData?.resp?.errInfo || 'Capture failed';
        setError(errorMessage);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [discoverRDService, makeRDServiceRequest, parseXMLResponse, onCaptureComplete]);

  // Auto-start capture when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && !loading && !captureSuccess) {
      handleCompleteCapture();
    }
  }, [autoStart, handleCompleteCapture, loading, captureSuccess]);

  return (
    <div className="space-y-4">
      {/* Device Info UI removed as requested */}

      {/* Error Display UI removed as requested */}

      {/* Status Indicator UI removed as requested */}
    </div>
  );
}
