"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, CreditCard } from "lucide-react";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "error" | "warning" | "success" | "info" | "low_balance";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  balance?: number;
  requiredBalance?: number;
}

export default function NotificationModal({
  open,
  onOpenChange,
  type,
  title,
  message,
  onConfirm,
  confirmText = "OK",
  showCancel = false,
  balance,
  requiredBalance = 100,
}: NotificationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "error":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "info":
        return <AlertCircle className="h-6 w-6 text-blue-600" />;
      case "low_balance":
        return <CreditCard className="h-6 w-6 text-red-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  const getDialogClasses = () => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      case "low_balance":
        return "border-red-200 bg-red-50";
      default:
        return "";
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "outline";
      case "success":
        return "default";
      case "info":
        return "outline";
      case "low_balance":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${getDialogClasses()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {message}
            {type === "low_balance" && balance !== undefined && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <span>Current Balance:</span>
                    <span className="font-semibold text-red-600">₹{balance}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Required Balance:</span>
                    <span className="font-semibold">₹{requiredBalance}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span>Shortfall:</span>
                    <span className="text-red-600">₹{Math.max(0, requiredBalance - balance)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          {showCancel && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-400"
            >
              Cancel
            </Button>
          )}
          <Button
            variant={getButtonVariant() as any}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}