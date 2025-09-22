import React from 'react'

interface ImageLoaderProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  children?: React.ReactNode
}

export default function ImageLoader({ src, alt, className, fallback, children }: ImageLoaderProps) {
  const [imageUrl, setImageUrl] = React.useState<string>(src)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<boolean>(false)

  const handleImageError = async () => {
    console.log('Standard image loading failed, trying fetch method:', src)
    setLoading(true)

    try {
      // Add cache-busting parameter
      const cacheBuster = `?t=${Date.now()}`
      const fetchUrl = src.includes('?') ? `${src}&${cacheBuster}` : `${src}${cacheBuster}`

      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'image/*',
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const dataUrl = URL.createObjectURL(blob)
        setImageUrl(dataUrl)
        setError(false)
      } else {
        console.error('Fetch method also failed:', response.status, response.statusText)
        setError(true)
      }
    } catch (fetchError) {
      console.error('Fetch method error:', fetchError)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return fallback || (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-500 text-center">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      {children ? (
        React.cloneElement(children as React.ReactElement<any>, {
          src: imageUrl,
          alt,
          className,
          onError: handleImageError,
          crossOrigin: "anonymous",
          referrerPolicy: "no-referrer-when-downgrade"
        })
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className={className}
          onError={handleImageError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}