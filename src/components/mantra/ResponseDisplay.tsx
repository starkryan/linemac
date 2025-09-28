'use client';

import React from 'react';

interface ResponseDisplayProps {
  response: any;
  isVisible: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, isVisible }) => {
  if (!isVisible || !response) return null;

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const formatXml = (xml: string) => {
    if (!xml) return '';
    // Simple XML formatting for display
    return xml
      .replace(/></g, '>\n<')
      .replace(/(\w+)="/g, '\n  $1="')
      .replace(/^\n/, '');
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Response Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Status</h4>
          <div className="text-sm">
            <p><span className="font-medium">Code:</span> {response.statusCode || 'N/A'}</p>
            <p><span className="font-medium">OK:</span> {response.ok ? 'Yes' : 'No'}</p>
            {response.mock && <p className="text-blue-600"><span className="font-medium">Mode:</span> Mock (Development)</p>}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Request Info</h4>
          <div className="text-sm">
            <p><span className="font-medium">Port:</span> {response.port || 'N/A'}</p>
            <p><span className="font-medium">Method:</span> {response.method || 'N/A'}</p>
          </div>
        </div>
      </div>

      {response.result && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Raw XML Response</h4>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto max-h-40">
            {formatXml(response.result.body)}
          </pre>
        </div>
      )}

      {response.result?.parsed && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Parsed Response</h4>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto max-h-40">
            {formatJson(response.result.parsed)}
          </pre>
        </div>
      )}

      {response.message && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Message</h4>
          <p className="text-sm text-gray-600">{response.message}</p>
        </div>
      )}

      {response.suggestion && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Suggestions</h4>
          <div className="text-sm text-blue-700 whitespace-pre-line">
            {response.suggestion}
          </div>
        </div>
      )}

      {response.error && (
        <div className="mt-4">
          <h4 className="font-medium text-red-700 mb-2">Error</h4>
          <div className="text-sm text-red-600">
            <p><span className="font-medium">Code:</span> {response.error_code || 'Unknown'}</p>
            <p><span className="font-medium">Message:</span> {response.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;