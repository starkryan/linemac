// Morpho Device Detection and Capture Component
// Based on RD_Test_Page.html functionality

export interface MorphoDeviceConfig {
  RDS: 'L0S' | 'L0H' | 'L1';
  PID_OPTS: string;
  Env: string;
  Ver: string;
  Skey: string;
  Wadh: string;
  posh: string;
}

export interface MorphoDeviceInfo {
  dpId: string;
  rdsId: string;
  rdsVer: string;
  mi: string;
  mc: string;
}

export interface MorphoCaptureResponse {
  pidData: string;
  base64Image: string;
  score: number;
  status: string;
}

export class MorphoService {
  private config: MorphoDeviceConfig = {
    RDS: 'L1',
    PID_OPTS: 'fingers',
    Env: 'P',
    Ver: '2.0',
    Skey: '',
    Wadh: '',
    posh: 'UNKNOWN'
  };

  private deviceInfo: MorphoDeviceInfo | null = null;
  private rdService: any = null;

  constructor(config?: Partial<MorphoDeviceConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeRDService();
  }

  private initializeRDService() {
    if (typeof window !== 'undefined') {
      // Use the actual RD Service from window object
      // @ts-ignore
      this.rdService = window.RDService || null;
    }
  }

  async initializeDevice(): Promise<boolean> {
    try {
      // Check for RD Service availability
      if (this.rdService) {
        // First check if RD Service is available
        const rdPortResult = await this.rdService.CheckRDPort();
        if (!rdPortResult) {
          throw new Error('RD Service not available or device not connected');
        }

        // Get device info
        const deviceInfo = await this.rdService.GetDeviceInfo();
        this.deviceInfo = {
          dpId: deviceInfo.dpId || 'Morpho_MSO_1300_E2',
          rdsId: deviceInfo.rdsId || 'RD123456',
          rdsVer: deviceInfo.rdsVer || '1.0',
          mi: deviceInfo.mi || 'MANUFACTURER_INFO',
          mc: deviceInfo.mc || 'MORPHO_1300_E2'
        };
        return true;
      } else {
        throw new Error('RD Service not loaded');
      }
    } catch (error) {
      console.error('Device initialization failed:', error);
      return false;
    }
  }

  
  async captureFingerprint(captureType: string = 'left'): Promise<MorphoCaptureResponse> {
    if (!this.rdService) {
      throw new Error('RD Service not initialized');
    }

    try {
      // Prepare PID options for RD Service
      const pidOptions = {
        env: this.config.Env,
        ver: this.config.Ver,
        rds: this.config.RDS,
        pidopts: this.config.PID_OPTS,
        posh: this.config.posh,
        Skey: this.config.Skey,
        Wadh: this.config.Wadh
      };

      // Use RD Service to capture fingerprint
      const pidData = await this.rdService.Capture(pidOptions);

      // Parse the PID data to extract score (simulate for now)
      const score = Math.floor(Math.random() * 45) + 50;

      // Simulate base64 image data (in real implementation, this would come from PID data)
      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      return {
        pidData,
        base64Image,
        score,
        status: score > 60 ? 'SUCCESS' : 'FAILED'
      };
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    }
  }

  getDeviceInfoStatus(): MorphoDeviceInfo | null {
    return this.deviceInfo;
  }

  getConfig(): MorphoDeviceConfig {
    return this.config;
  }

  async disconnect(): Promise<void> {
    if (this.rdService) {
      // Disconnect RD Service
      this.rdService = null;
      this.deviceInfo = null;
    }
  }
}