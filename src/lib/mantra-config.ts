export interface MantraConfig {
  rdServiceHost: string;
  rdServicePort: number;
  enableRemoteAccess: boolean;
  authKey?: string;
  useMockInProduction: boolean;
}

export const getMantraConfig = (): MantraConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    rdServiceHost: process.env.MANTRA_RD_HOST || (isDevelopment ? '127.0.0.1' : 'localhost'),
    rdServicePort: parseInt(process.env.MANTRA_RD_PORT || '11101'),
    enableRemoteAccess: process.env.MANTRA_REMOTE_ACCESS === 'true',
    authKey: process.env.MANTRA_AUTH_KEY,
    useMockInProduction: process.env.MANTRA_USE_MOCK_PROD === 'true'
  };
};

export const validateMantraConfig = (config: MantraConfig): string[] => {
  const errors: string[] = [];

  if (!config.rdServiceHost) {
    errors.push('RDService host is required');
  }

  if (config.rdServicePort < 1 || config.rdServicePort > 65535) {
    errors.push('RDService port must be between 1 and 65535');
  }

  if (config.enableRemoteAccess && !config.authKey) {
    errors.push('Auth key is required for remote access');
  }

  return errors;
};