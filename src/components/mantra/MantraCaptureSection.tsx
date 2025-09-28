'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AadhaarMantraCapture } from "./AadhaarMantraCapture"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"

interface MantraCaptureSectionProps {
  onCaptureComplete: (data: {
    errCode: string;
    errInfo: string;
    qScore: string;
    nmPoints: string;
    captureData: any;
  }) => void;
}

export function MantraCaptureSection({ onCaptureComplete }: MantraCaptureSectionProps) {
  const [showCapture, setShowCapture] = useState(false);
  const [captureResults, setCaptureResults] = useState<any>(null);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);

  const handleCaptureComplete = (data: any) => {
    setCaptureResults(data);
    setIsDeviceConnected(true);

    // Format the response as requested
    const formattedResponse = {
      errCode: "0",
      errInfo: "Success.",
      qScore: data.qScore?.toString() || "0",
      nmPoints: data.nmPoints || "0",
      captureData: data
    };

    onCaptureComplete(formattedResponse);
  };

  const handleDiscoverDevice = () => {
    setShowCapture(true);
  };

  const getSuccessRate = (score: number) => {
    if (score >= 90) return { rate: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { rate: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 50) return { rate: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { rate: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const successRate = captureResults ? getSuccessRate(captureResults.quality || 0) : null;

  return (
    <div className="space-y-4">
      {/* Aadhaar Icon Click to Discover */}
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg"
             onClick={handleDiscoverDevice}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
              <AadhaarIcon className="w-10 h-10" />
            </div>
            <div className="text-sm font-medium text-blue-800">
              Click to Discover Device
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Mantra Fingerprint Scanner
            </div>
          </div>
        </div>
      </div>

      {/* Capture Interface */}
      {showCapture && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <AadhaarIcon className="w-5 h-5 text-white" />
              </div>
              Mantra Fingerprint Capture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AadhaarMantraCapture
              captureType="left"
              title="Left Hand Fingerprint"
              onCaptureComplete={handleCaptureComplete}
              autoStart={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Capture Results Display */}
      {captureResults && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-bold text-green-800">
                🎯 Capture Results
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Quality Score</div>
                  <div className={`text-3xl font-bold ${successRate?.color}`}>
                    {captureResults.qScore || captureResults.quality || '0'}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${successRate?.bgColor} ${successRate?.color} mt-2 inline-block`}>
                    {successRate?.rate}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Minutiae Points</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {captureResults.nmPoints || '0'}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {parseInt(captureResults.nmPoints || '0') >= 25 ? 'High Detail' : 'Standard'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Status</div>
                  <div className="text-3xl font-bold text-purple-600">
                    ✓
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Success
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-gray-800 mb-3">Capture Details:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Code:</span>
                    <span className="font-mono font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Info:</span>
                    <span className="font-medium text-green-600">Success</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capture Time:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Finger Type:</span>
                    <span className="font-medium">Left Hand</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowCapture(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Hide Interface
                </Button>
                <Button
                  onClick={() => {
                    setCaptureResults(null);
                    setShowCapture(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Capture Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Status */}
      {isDeviceConnected && !captureResults && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                📡 Device Connected - Ready for Capture
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}