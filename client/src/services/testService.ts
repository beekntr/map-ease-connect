import { apiRequest } from '@/lib/api';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
}

export interface DBTestResponse {
  message: string;
  stats: {
    users: number;
    tenants: number;
    events: number;
  };
  timestamp: string;
}

export interface UploadTestResponse {
  message: string;
  storage: string;
  isProduction: boolean;
  r2Configured: boolean;
  baseDomain: string;
  timestamp: string;
}

export interface SSOTestResponse {
  message: string;
  ssoUrl: string;
  superAdmins: string[];
  timestamp: string;
}

export const testService = {
  // Health check
  healthCheck: async (): Promise<HealthCheckResponse> => {
    return apiRequest<HealthCheckResponse>('/health');
  },

  // Database test
  testDatabase: async (): Promise<DBTestResponse> => {
    return apiRequest<DBTestResponse>('/api/test/db-test');
  },

  // Upload configuration test
  testUpload: async (): Promise<UploadTestResponse> => {
    return apiRequest<UploadTestResponse>('/api/test/upload-test');
  },

  // SSO configuration test
  testSSO: async (): Promise<SSOTestResponse> => {
    return apiRequest<SSOTestResponse>('/api/test/sso-test');
  },

  // Full system test
  fullSystemTest: async (): Promise<{
    health: HealthCheckResponse;
    database: DBTestResponse;
    upload: UploadTestResponse;
    sso: SSOTestResponse;
    allPassed: boolean;
  }> => {
    try {
      const [health, database, upload, sso] = await Promise.all([
        testService.healthCheck(),
        testService.testDatabase(),
        testService.testUpload(),
        testService.testSSO(),
      ]);

      const allPassed = 
        health.status === 'OK' &&
        database.message.includes('successful') &&
        upload.message.includes('configuration') &&
        sso.message.includes('configuration');

      return {
        health,
        database,
        upload,
        sso,
        allPassed,
      };
    } catch (error) {
      console.error('System test failed:', error);
      throw error;
    }
  },
};
