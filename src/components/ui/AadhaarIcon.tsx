import Image from "next/image"

interface AadhaarIconProps {
  className?: string
  mirrored?: boolean
}

export function AadhaarIcon({ className = "", mirrored = false }: AadhaarIconProps) {
  return (
    <Image
      src="/aadhaar-icon.png"
      alt="Aadhaar"
      width={20}
      height={20}
      className={`${className} bg-transparent ${mirrored ? 'transform scale-x-[-1]' : ''}`}
    />
  )
}