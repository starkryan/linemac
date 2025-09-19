// RD Service Implementation based on RD_Test_Page.html
// This implements the actual working XMLHttpRequest approach

export interface RDServiceConfig {
  ip: string;
  port: string;
  protocol: string;
  rdServiceType: 'L0S' | 'L0H' | 'L1';
}

export interface DeviceInfo {
  dpId: string;
  rdsId: string;
  rdsVer: string;
  dc: string;
  mi: string;
  mc: string;
}

export interface CaptureOptions {
  env: string;
  ver: string;
  fCount: string;
  fType: string;
  format: string;
  pidVer: string;
  timeout: string;
  otp: string;
  wadh: string;
  posh: string;
}

export interface CaptureResponse {
  pidData: string;
  base64Image?: string;
  score?: number;
  status: string;
  deviceInfo?: DeviceInfo;
}

export class RDService {
  private config: RDServiceConfig;
  private baseUrl: string;

  constructor(config: Partial<RDServiceConfig> = {}) {
    this.config = {
      ip: config.ip || '127.0.0.1',
      port: config.port || '11100',
      protocol: config.protocol || 'http',
      rdServiceType: config.rdServiceType || 'L1'
    };

    this.baseUrl = `${this.config.protocol}://${this.config.ip}:${this.config.port}`;
  }

  private createXHR(): XMLHttpRequest {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      // @ts-ignore - ActiveXObject is for IE only
      return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
      return new XMLHttpRequest();
    }
  }

  private async makeRequest(method: string, url: string, data?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = this.createXHR();

      xhr.open(method, url, true);

      // Set headers based on the original test page implementation
      if (method === 'CAPTURE' && data) {
        xhr.setRequestHeader("Content-Type", "text/xml");
        xhr.setRequestHeader("Accept", "text/xml");
      }

      xhr.onreadystatechange = async () => {
        if (xhr.readyState == 4) {
          var status = xhr.status;
          var response = xhr.responseText;

          console.log(`RD Service Response - Method: ${method}, URL: ${url}, Status: ${status}, Response: ${response?.substring(0, 200)}`);

          if (status == 200) {
            resolve(response);
          } else if (status == 0) {
            // Status 0 usually means CORS error or network issue
            console.error('RD Service network error - possible CORS issue or service not running');
            reject(new Error('Unable to connect to RD Service. Please ensure:\n1. RD Service is running on port 11100\n2. No CORS issues (try running from localhost)\n3. Network connectivity'));
          } else {
            reject(new Error(`Request failed with status ${status}: ${response}`));
          }
        }
      };

      xhr.onerror = () => {
        console.error('RD Service network error occurred');
        reject(new Error('Network error occurred while connecting to RD Service'));
      };

      xhr.onabort = () => {
        console.error('RD Service request was aborted');
        reject(new Error('RD Service request was aborted'));
      };

      try {
        if (data) {
          xhr.send(data);
        } else {
          xhr.send();
        }
      } catch (sendError) {
        console.error('Error sending RD Service request:', sendError);
        reject(new Error(`Failed to send request: ${sendError}`));
      }
    });
  }

  // Alternative method that uses polling like the original test page
  private async makeRequestWithPolling(method: string, url: string, data?: string): Promise<string> {
    const xhr = this.createXHR();

    xhr.open(method, url, true);

    // Set headers based on the original test page implementation
    if (method === 'CAPTURE' && data) {
      xhr.setRequestHeader("Content-Type", "text/xml");
      xhr.setRequestHeader("Accept", "text/xml");
    }

    xhr.send(data || null);

    // Wait for response using polling like the original test page
    let text = "";
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while ((text == null || text == "") && attempts < maxAttempts) {
      await this.sleep(1000);
      text = method === 'CAPTURE' ? xhr.responseText : xhr.response;
      attempts++;
      console.log(`Waiting for RD Service response... attempt ${attempts}, response: ${text?.substring(0, 100)}`);
    }

    if (text == null || text == "") {
      throw new Error('RD Service request timed out after 30 seconds');
    }

    console.log(`RD Service Response received - Method: ${method}, Response: ${text.substring(0, 200)}`);
    return text;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkRDService(): Promise<boolean> {
    try {
      const url = this.baseUrl;
      console.log('Checking RD Service at:', url);

      // First try a simple HTTP GET to see if the service is responding
      try {
        const testResponse = await fetch(url, {
          method: 'GET',
          mode: 'no-cors'
        });
        console.log('RD Service test connection successful');
      } catch (fetchError) {
        console.log('RD Service test connection failed (this is expected for custom methods):', fetchError);
      }

      const response = await this.makeRequest('RDSERVICE', url);
      console.log('RD Service response:', response);

      // Check if response contains the expected RD Service identifier
      const expectedService = this.config.rdServiceType === 'L0S' ? 'Morpho_RD_Service' :
                             this.config.rdServiceType === 'L0H' ? 'MORPHO_RD_SERVICE' :
                             'IDEMIA_L1_RDSERVICE';

      const found = response.includes(expectedService);
      console.log('Expected service:', expectedService, 'Found:', found);
      return found;
    } catch (error) {
      console.error('RD Service check failed:', error);
      return false;
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const url = `${this.baseUrl}/DEVICEINFO`;
      const response = await this.makeRequestWithPolling('DEVICEINFO', url);

      // Parse XML response to extract device info
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, "application/xml");

      const deviceInfoNode = xmlDoc.querySelector('DeviceInfo');
      if (!deviceInfoNode) {
        throw new Error('Device info not found in response');
      }

      return {
        dpId: deviceInfoNode.getAttribute('dpId') || '',
        rdsId: deviceInfoNode.getAttribute('rdsId') || '',
        rdsVer: deviceInfoNode.getAttribute('rdsVer') || '',
        dc: deviceInfoNode.getAttribute('dc') || '',
        mi: deviceInfoNode.getAttribute('mi') || '',
        mc: deviceInfoNode.getAttribute('mc') || ''
      };
    } catch (error) {
      console.error('Device info request failed:', error);
      throw error;
    }
  }

  async captureFingerprint(options: Partial<CaptureOptions> = {}): Promise<CaptureResponse> {
    try {
      const captureOptions: CaptureOptions = {
        env: options.env || 'P',
        ver: options.ver || '1.0',
        fCount: options.fCount || '1',
        fType: options.fType || '0',
        format: options.format || '0',
        pidVer: options.pidVer || '2.0',
        timeout: options.timeout || '10000',
        otp: options.otp || '',
        wadh: options.wadh || '',
        posh: options.posh || ''
      };

      // Create PID options XML
      const pidOptsXml = `<PidOptions ver="${captureOptions.ver}">
<Opts env="${captureOptions.env}" fCount="${captureOptions.fCount}" fType="${captureOptions.fType}" format="${captureOptions.format}" pidVer="${captureOptions.pidVer}" timeout="${captureOptions.timeout}" otp="${captureOptions.otp}" wadh="${captureOptions.wadh}" posh="${captureOptions.posh}"/>
</PidOptions>`;

      console.log('Capture options XML:', pidOptsXml);

      const url = `${this.baseUrl}/CAPTURE`;
      console.log('Capture URL:', url);

      // Use polling method like the original test page
      const response = await this.makeRequestWithPolling('CAPTURE', url, pidOptsXml);
      console.log('Capture response:', response);

      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, "application/xml");

      const respNode = xmlDoc.querySelector('Resp');
      const deviceInfoNode = xmlDoc.querySelector('DeviceInfo');

      const status = respNode?.getAttribute('errCode') === '0' ? 'SUCCESS' : 'FAILED';
      const score = parseInt(respNode?.getAttribute('qScore') || '0');

      console.log('Capture status:', status, 'Score:', score);

      // Extract device info if available
      let deviceInfo: DeviceInfo | undefined;
      if (deviceInfoNode) {
        deviceInfo = {
          dpId: deviceInfoNode.getAttribute('dpId') || '',
          rdsId: deviceInfoNode.getAttribute('rdsId') || '',
          rdsVer: deviceInfoNode.getAttribute('rdsVer') || '',
          dc: deviceInfoNode.getAttribute('dc') || '',
          mi: deviceInfoNode.getAttribute('mi') || '',
          mc: deviceInfoNode.getAttribute('mc') || ''
        };
      }

      return {
        pidData: response,
        base64Image: this.extractBase64Image(response),
        score: score,
        status: status,
        deviceInfo: deviceInfo
      };
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    }
  }

  private extractBase64Image(xmlResponse: string): string | undefined {
    // This is a simplified extraction - in real implementation,
    // you would parse the XML to extract the actual base64 image data
    // For now, return a placeholder
    return undefined;
  }

  getConfig(): RDServiceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<RDServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.baseUrl = `${this.config.protocol}://${this.config.ip}:${this.config.port}`;
  }
}