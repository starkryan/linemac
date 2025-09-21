"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  CreditCard,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Fingerprint,
  MapPin,
  Briefcase,
  Building,
} from "lucide-react";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
  onPasswordChanged?: () => void;
}

export default function UserDetailsModal({
  open,
  onOpenChange,
  user,
  onPasswordChanged,
}: UserDetailsModalProps) {
  // Early return if user is null
  if (!user) {
    return null;
  }
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "supervisor": return "bg-purple-100 text-purple-800";
      case "operator": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatAadhaar = (aadhaar?: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar || 'N/A';
    return aadhaar; // Show full Aadhaar number for admin display
  };

  const handlePasswordChange = async () => {
    // Reset previous messages
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!user?.id) {
      setPasswordError("User ID is required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      if (onPasswordChanged) {
        onPasswordChanged();
      }

      // Close modal after successful password change
      setTimeout(() => {
        onOpenChange(false);
        setPasswordSuccess("");
      }, 2000);

    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback>
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{user.name || 'Unknown User'}</div>
              <div className="text-sm text-gray-500">{user.email || 'No email provided'}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View and manage user account details
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <User className="h-4 w-4" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <div className="text-sm font-medium">{user.name || 'Not provided'}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                  <div className="text-sm font-medium flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span>{user.email || 'Not provided'}</span>
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                    <div className="text-sm font-medium flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(user.status || 'unknown')}>
                      {user.status || 'Unknown'}
                    </Badge>
                    {user.is_blocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Important Fields */}
          <div className="space-y-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base text-blue-800">
                  <Fingerprint className="h-4 w-4" />
                  <span>Important Fields</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-700">User ID</Label>
                  <div className="text-lg font-mono font-bold text-blue-900">
                    {user.id || 'Not available'}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Unique identifier</div>
                </div>

                {user.operator_uid && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-700">Operator UID</Label>
                    <div className="text-lg font-mono font-bold text-blue-900">
                      {user.operator_uid}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Operator identifier</div>
                  </div>
                )}

                {user.operator_name && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-700">Operator Name</Label>
                    <div className="text-lg font-bold text-blue-900">
                      {user.operator_name}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Display name</div>
                  </div>
                )}

                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-700 flex items-center space-x-1">
                    <Key className="h-3 w-3" />
                    <span>Password</span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {showPasswordForm ? "Cancel" : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Change Form */}
            {showPasswordForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Key className="h-4 w-4" />
                    <span>Change Password</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-800">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">{passwordError}</span>
                      </div>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{passwordSuccess}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Additional Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Shield className="h-4 w-4" />
                  <span>Account Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role || 'Unknown'}
                  </Badge>
                </div>

                {user.aadhaar_number && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Aadhaar Number</Label>
                    <div className="text-sm font-mono">{formatAadhaar(user.aadhaar_number)}</div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Balance</Label>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{user.balance || 0}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Member Since</span>
                  </Label>
                  <div className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'Not available'}</div>
                </div>

                {user.updatedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                    <div className="text-sm">{formatDate(user.updatedAt)}</div>
                  </div>
                )}

                {user.created_by && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created By</Label>
                    <div className="text-sm font-mono text-xs">{user.created_by}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}