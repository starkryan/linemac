import Image from "next/image"

interface AadhaarIconProps {
  className?: string
  mirrored?: boolean
  isPaused?: boolean
}

export function AadhaarIcon({ className = "", mirrored = false, isPaused = false }: AadhaarIconProps) {
  return (
    <Image
      src={isPaused ? "/arrow-pause.png" : "/aadhaar-icon.png"}
      alt={isPaused ? "Pause" : "Aadhaar"}
      width={20}
      height={20}
      className={`${className} bg-transparent ${mirrored ? 'transform scale-x-[-1]' : ''}`}
    />
  )
}
