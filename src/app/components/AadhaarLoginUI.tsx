"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";

type FormData = {
  operatorUid: string;
  operatorName: string;
  password: string;
};

export default function AadhaarLoginUI() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Login attempt for:", data.operatorName);

      // First, validate with our custom endpoint
      const validationResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorUid: data.operatorUid,
          operatorName: data.operatorName,
          password: data.password,
        }),
      });

      console.log("Login response status:", validationResponse.status);

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        console.error("Login failed:", errorData);
        throw new Error(errorData.error || errorData.message || 'Login failed');
      }

      const validationData = await validationResponse.json();
      console.log("Login successful:", validationData);

      // Verify session was created by checking session endpoint
      setTimeout(async () => {
        try {
          const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include',
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log("Session verified:", sessionData);

            // If admin user, redirect to admin, otherwise to aadhaar correction
            if (sessionData.user.role === 'admin') {
              window.location.href = '/admin';
            } else {
              window.location.href = '/aadhaar-correction';
            }
          } else {
            console.error("Session verification failed");
            setError('Login succeeded but session could not be verified');
          }
        } catch (sessionError) {
          console.error("Session check error:", sessionError);
          setError('Login succeeded but session verification failed');
        }
      }, 500);

    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
            Aadhaar UCL Login
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="operatorUid" className="text-sm">Operator UID</Label>
                      <Input
                        id="operatorUid"
                        type="text"
                        placeholder="0000 0000 0000"
                        className="mt-1"
                        {...register('operatorUid', { required: 'Operator UID is required' })}
                      />
                      {errors.operatorUid && (
                        <p className="text-red-500 text-xs mt-1">{errors.operatorUid.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="operatorName" className="text-sm">Operator Name</Label>
                      <Input
                        id="operatorName"
                        type="text"
                        placeholder="Enter Operator Name"
                        className="mt-1"
                        {...register('operatorName', { required: 'Operator Name is required' })}
                      />
                      {errors.operatorName && (
                        <p className="text-red-500 text-xs mt-1">{errors.operatorName.message as string}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter Password"
                        className="mt-1"
                        {...register('password', { required: 'Password is required' })}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button variant="secondary" className="border " type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Submit'}
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
