"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: 'admin' | 'supervisor' | 'operator';
  phone?: string;
  aadhaar_number?: string;
}

export default function AadhaarRegisterUI() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch("password");

  // Check current user session on component mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        setCurrentUser(session.user);
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const canCreateAdmin = currentUser?.role === 'admin';
  const canCreateSupervisor = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const requestBody: any = {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
      };

      // Add optional fields if provided
      if (data.role && (canCreateAdmin || canCreateSupervisor)) {
        requestBody.role = data.role;
      }
      if (data.phone) {
        requestBody.phone = data.phone;
      }
      if (data.aadhaar_number) {
        requestBody.aadhaar_number = data.aadhaar_number;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setSuccess(result.message || 'Registration successful! Please check your email for verification.');
      console.log('Registration success:', result);

      // Clear form
      setTimeout(() => {
        router.push('/'); // Redirect to login page after successful registration
      }, 3000);

    } catch (err: unknown) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl shadow-lg border-2 border-black">
        {/* Header */}
        <div className="bg-black text-white px-6 py-3 flex items-center justify-end">
          <h1 className="text-lg font-semibold flex items-center">
            Aadhaar UCL Registration
            <Image
              src="/key.png"
              alt="Key icon"
              width={20}
              height={20}
              className="ml-2"
            />
          </h1>
        </div>

        <div className="bg-white p-6">
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* Left: Logo area */}
            <div className="col-span-12 md:col-span-6 flex items-center justify-center">
              <div className="w-64">
                <Image
                  src="/logo.png"
                  alt="Aadhaar logo"
                  width={256}
                  height={256}
                  className="object-contain w-full h-auto"
                />
                <p className="text-center text-xs text-gray-500 mt-2">Enrolment Update Client<br/>version 3.3.1.0</p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="col-span-12 md:col-span-6">
              <Card className="shadow-none border">
                <CardContent className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="mt-1"
                        {...register('name', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters long'
                          }
                        })}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="mt-1"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-sm">Username</Label>
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        className="mt-1"
                        {...register('username', {
                          required: 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters long'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Username can only contain letters, numbers, and underscores'
                          }
                        })}
                      />
                      {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="mt-1"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters long'
                          }
                        })}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className="mt-1"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === password || 'Passwords do not match'
                        })}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>
                      )}
                    </div>

                    {/* Admin-only fields */}
                    {!isLoadingUser && currentUser && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Admin Options</h3>
                          <Badge variant="outline">
                            {currentUser.role} - {currentUser.name}
                          </Badge>
                        </div>

                        {/* Role Selection */}
                        {(canCreateAdmin || canCreateSupervisor) && (
                          <div>
                            <Label htmlFor="role" className="text-sm">User Role</Label>
                            <select
                              id="role"
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              {...register('role')}
                            >
                              <option value="operator">Operator (Default)</option>
                              {canCreateSupervisor && (
                                <option value="supervisor">Supervisor</option>
                              )}
                              {canCreateAdmin && (
                                <option value="admin">Admin</option>
                              )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Select the role for the new user. Default is operator.
                            </p>
                          </div>
                        )}

                        {/* Phone Number */}
                        <div>
                          <Label htmlFor="phone" className="text-sm">Phone Number (Optional)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            className="mt-1"
                            {...register('phone', {
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: 'Please enter a valid 10-digit phone number'
                              }
                            })}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>
                          )}
                        </div>

                        {/* Aadhaar Number */}
                        <div>
                          <Label htmlFor="aadhaar_number" className="text-sm">Aadhaar Number (Optional)</Label>
                          <Input
                            id="aadhaar_number"
                            placeholder="Enter 12-digit Aadhaar number"
                            className="mt-1"
                            {...register('aadhaar_number', {
                              pattern: {
                                value: /^[0-9]{12}$/,
                                message: 'Please enter a valid 12-digit Aadhaar number'
                              }
                            })}
                          />
                          {errors.aadhaar_number && (
                            <p className="text-red-500 text-xs mt-1">{errors.aadhaar_number.message as string}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/')}
                        disabled={isSubmitting}
                      >
                        Back to Login
                      </Button>

                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Register'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-100 text-center text-sm py-2 border-t">
          <span className="text-gray-700">Copyright (c) UID Authority of India, all rights reserved</span>
        </div>
      </div>
    </div>
  );
}