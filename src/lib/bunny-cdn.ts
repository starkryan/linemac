
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
      // TEMPORARY: Mock upload for testing
      if (process.env.NODE_ENV === 'development') {
        const mockUrl = `https://mock-cdn.example.com/${filename}`
        console.log('Mock upload:', { filename, size: file instanceof File ? file.size : 'buffer' })
        return { success: true, url: mockUrl }
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

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey,
          'Content-Type': contentType || 'application/octet-stream',
        },
        body: new Uint8Array(buffer)
      })

      if (response.ok) {
        const cdnUrl = `https://${this.config.storageZoneName}.b-cdn.net/${filename}`
        return { success: true, url: cdnUrl }
      } else {
        const errorText = await response.text()
        return { success: false, error: `Bunny CDN upload failed: ${errorText}` }
      }
    } catch (error) {
      return { success: false, error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  async deleteFile(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/${filename}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.config.accessKey,
        }
      })

      if (response.ok) {
        return { success: true }
      } else {
        const errorText = await response.text()
        return { success: false, error: `Bunny CDN delete failed: ${errorText}` }
      }
    } catch (error) {
      return { success: false, error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }
}

export const bunnyCDN = new BunnyCDN()
export default BunnyCDN