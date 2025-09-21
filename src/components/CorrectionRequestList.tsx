"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CorrectionRequestModal from "@/components/ui/CorrectionRequestModal";
import { CheckCircle, Clock, XCircle, AlertTriangle, Eye } from "lucide-react";

interface CorrectionRequest {
  id: string;
  name: string;
  aadhaar_number: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  operator_name?: string;
}

export default function CorrectionRequestList() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/correction-requests/list');
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/correction-requests/${id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchRequests(); // Refresh the list
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      rejected: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatAadhaar = (aadhaar: string) => {
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Correction Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{request.name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Aadhaar:</strong> {formatAadhaar(request.aadhaar_number)}</p>
                        <p><strong>Created:</strong> {formatDate(request.created_at)}</p>
                        {request.operator_name && (
                          <p><strong>Operator:</strong> {request.operator_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No correction requests found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CorrectionRequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        request={selectedRequest}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isLoading}
      />
    </div>
  );
}