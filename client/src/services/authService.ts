import { apiRequest } from '@/lib/api';
import type { User } from '@/lib/api';

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SSOLoginResponse {
  loginUrl: string;
}

export const authService = {
  // SSO callback
  ssoCallback: async (token: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/sso/callback', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Verify token
  verifyToken: async (): Promise<{ user: User }> => {
    return apiRequest<{ user: User }>('/api/auth/verify');
  },

  // Get SSO login URL
  getSSOLoginUrl: async (redirectUrl?: string): Promise<SSOLoginResponse> => {
    const params = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    return apiRequest<SSOLoginResponse>(`/api/auth/sso/login${params}`);
  },

  // Logout
  logout: async (): Promise<void> => {
    return apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    });
  },
};
