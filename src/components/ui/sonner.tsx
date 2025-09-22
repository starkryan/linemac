"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CheckCircle className="h-5 w-5 text-green-600" />,
        error: <XCircle className="h-5 w-5 text-red-600" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
        info: <Info className="h-5 w-5 text-blue-600" />,
      }}
      toastOptions={{
        className: "aadhaar-toast",
        style: {
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#374151",
          backgroundColor: "#ffffff",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
