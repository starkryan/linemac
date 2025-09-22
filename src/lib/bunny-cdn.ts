
interface BunnyCDNConfig {
  storageZoneName: string
  accessKey: string
  region?: string
}

class BunnyCDN {
  private config: BunnyCDNConfig

  constructor() {
    this.config = {
      storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME || 'ucl-storage',
      accessKey: process.env.BUNNY_CDN_SECRET || '',
      region: process.env.BUNNY_CDN_REGION || ''
    }
  }

  private getBaseUrl(): string {
    const hostname = this.config.region
      ? `${this.config.region}.storage.bunnycdn.com`
      : 'storage.bunnycdn.com'

    return `https://${hostname}/${this.config.storageZoneName}`
  }

  async uploadFile(file: File | Buffer, filename: string, contentType?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('Bunny CDN Upload:', {
        filename,
        size: file instanceof File ? file.size : 'buffer',
        storageZone: this.config.storageZoneName,
        hasAccessKey: !!this.config.accessKey,
        accessKeyLength: this.config.accessKey?.length || 0
      })

      // Check if credentials are properly configured
      if (!this.config.accessKey || this.config.accessKey.length < 10) {
        const error = 'Bunny CDN access key not properly configured'
        console.error(error)
        return { success: false, error }
      }

      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/${filename}`

      let buffer: Buffer
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = file
      }

      console.log('Bunny CDN API Request:', {
        url,
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey ? '[REDACTED]' : 'missing',
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Length': buffer.length
        },
        bufferSize: buffer.length
      })

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey,
          'Content-Type': contentType || 'application/octet-stream',
        },
        body: new Uint8Array(buffer)
      })

      console.log('Bunny CDN API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const cdnUrl = `https://${this.config.storageZoneName}.b-cdn.net/${filename}`
        console.log('Bunny CDN upload successful:', cdnUrl)
        return { success: true, url: cdnUrl }
      } else {
        const errorText = await response.text()
        console.error('Bunny CDN upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: url
        })
        return { success: false, error: `Bunny CDN upload failed (${response.status}): ${errorText}` }
      }
    } catch (error) {
      console.error('Bunny CDN upload error:', error)
      return { success: false, error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  async deleteFile(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.config.accessKey || this.config.accessKey.length < 10) {
        const error = 'Bunny CDN access key not properly configured'
        console.error(error)
        return { success: false, error }
      }

      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/${filename}`

      console.log('Bunny CDN Delete Request:', {
        url,
        method: 'DELETE'
      })

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.config.accessKey,
        }
      })

      console.log('Bunny CDN Delete Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        console.log('Bunny CDN delete successful:', filename)
        return { success: true }
      } else {
        const errorText = await response.text()
        console.error('Bunny CDN delete failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: url
        })
        return { success: false, error: `Bunny CDN delete failed (${response.status}): ${errorText}` }
      }
    } catch (error) {
      console.error('Bunny CDN delete error:', error)
      return { success: false, error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }
}

export const bunnyCDN = new BunnyCDN()
export default BunnyCDN