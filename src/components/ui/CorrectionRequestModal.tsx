"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

interface CorrectionRequest {
  id: string;
  name: string;
  aadhaar_number: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'approved';
  created_at: string;
  updated_at: string;
  operator_name?: string;
}

interface CorrectionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CorrectionRequest | null;
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CorrectionRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateStatus,
  isLoading = false,
}: CorrectionRequestModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (request) {
      setSelectedStatus(request.status);
      setNotes('');
    }
  }, [request]);

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

  const handleUpdate = async () => {
    if (!request || !selectedStatus) return;

    await onUpdateStatus(request.id, selectedStatus, notes);
    onOpenChange(false);
  };

  const isUpdateDisabled = !selectedStatus || selectedStatus === request.status || isLoading;

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Correction Request Details</DialogTitle>
          <DialogDescription>
            View and update correction request information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Request ID</Label>
              <p className="text-sm font-mono text-gray-900">{request.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="mt-1">{getStatusBadge(request.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Applicant Name</Label>
              <p className="text-sm text-gray-900">{request.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Aadhaar Number</Label>
              <p className="text-sm font-mono text-gray-900">
                {request.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Created Date</Label>
              <p className="text-sm text-gray-900">
                {new Date(request.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
              <p className="text-sm text-gray-900">
                {new Date(request.updated_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {request.operator_name && (
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-600">Operator Name</Label>
                <p className="text-sm text-gray-900">{request.operator_name}</p>
              </div>
            )}
          </div>

          {/* Status Update Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Update Status
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status update..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdateDisabled}
            className="min-w-[100px]"
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}