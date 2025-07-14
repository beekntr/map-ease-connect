import { apiRequest } from '@/lib/api';
import type { User, PaginatedResponse } from '@/lib/api';

export interface UserDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  stats?: {
    totalTenants?: number;
    totalUsers?: number;
    totalEvents?: number;
    managedTenants?: number;
    totalRegistrations?: number;
    approvedRegistrations?: number;
    pendingRegistrations?: number;
  };
  managedTenants?: Array<{
    id: string;
    placeName: string;
    subdomain: string;
    eventsCount: number;
    totalRegistrations: number;
  }>;
  recentEvents?: any[];
  registeredEvents?: any[];
}

export interface UserProfile {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    managedTenants: Array<{
      id: string;
      placeName: string;
      subdomain: string;
      isActive: boolean;
    }>;
    createdTenants: Array<{
      id: string;
      placeName: string;
      subdomain: string;
      isActive: boolean;
      createdAt: string;
    }>;
  };
}

export const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>('/api/user/profile');
  },

  // Update user profile
  updateProfile: async (data: { name?: string }): Promise<{ message: string; user: User }> => {
    return apiRequest<{ message: string; user: User }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user dashboard
  getDashboard: async (): Promise<UserDashboard> => {
    return apiRequest<UserDashboard>('/api/user/dashboard');
  },

  // Get user's registered events
  getRegisteredEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/api/user/events${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<PaginatedResponse<any>>(endpoint);
  },
};
