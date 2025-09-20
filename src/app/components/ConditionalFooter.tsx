"use client"

import { StatusFooter } from "./AadhaarFooterUI"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export function ConditionalFooter() {
  const { isAuthenticated, isPending } = useAuthGuard(false)

  // Only show footer if user is authenticated
  if (!isAuthenticated && !isPending) {
    return null
  }

  // Show loading state or footer
  return isPending ? null : <StatusFooter />
}