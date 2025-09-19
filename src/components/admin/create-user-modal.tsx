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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Hash, Shield, Info } from "lucide-react";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  phone: string;
  aadhaar_number: string;
  role: "operator" | "supervisor";
  operator_uid: string;
  operator_name: string;
}

export default function CreateUserModal({ open, onOpenChange, onUserCreated }: CreateUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    aadhaar_number: "",
    role: "operator",
    operator_uid: "",
    operator_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      phone: "",
      aadhaar_number: "",
      role: "operator",
      operator_uid: "",
      operator_name: "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      setError("All required fields must be filled");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    if (formData.role === "operator" && (!formData.operator_uid || !formData.operator_name)) {
      setError("Operator UID and Operator Name are required for operator role");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          phone: formData.phone || undefined,
          aadhaar_number: formData.aadhaar_number || undefined,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      onUserCreated();

      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);

    } catch (err: unknown) {
      console.error('User creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateOperatorId = () => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OP${randomNum}`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Create New User</span>
          </DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="operator">Operator Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaar_number" className="flex items-center space-x-1">
                    <Hash className="h-4 w-4" />
                    <span>Aadhaar Number</span>
                  </Label>
                  <Input
                    id="aadhaar_number"
                    value={formData.aadhaar_number}
                    onChange={(e) => handleInputChange("aadhaar_number", e.target.value)}
                    placeholder="Enter Aadhaar number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>User Role *</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Operator</Badge>
                        <span>Standard operator access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisor">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Supervisor</Badge>
                        <span>Supervisor access with oversight</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="operator" className="space-y-4">
              {formData.role === "operator" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Operator Login Credentials</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      These credentials will be used for the operator login interface.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="operator_uid">Operator UID *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="operator_uid"
                          value={formData.operator_uid}
                          onChange={(e) => handleInputChange("operator_uid", e.target.value)}
                          placeholder="e.g., OP001"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange("operator_uid", generateOperatorId())}
                          className="whitespace-nowrap"
                        >
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operator_name">Operator Name *</Label>
                      <Input
                        id="operator_name"
                        value={formData.operator_name}
                        onChange={(e) => handleInputChange("operator_name", e.target.value)}
                        placeholder="Enter operator display name"
                        required
                      />
                    </div>
                  </div>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Login Preview</h4>
                      <div className="bg-gray-50 rounded p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Operator UID:</span>
                          <span className="font-mono">{formData.operator_uid || "Not set"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Operator Name:</span>
                          <span>{formData.operator_name || "Not set"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Password:</span>
                          <span>{formData.password ? "••••••••" : "Not set"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {formData.role === "supervisor" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-purple-700">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Supervisor Account</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Supervisors use email-based login and do not require operator credentials.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}