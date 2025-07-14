import { apiRequest } from '@/lib/api';
import type { Tenant, Event, PaginatedResponse } from '@/lib/api';

export interface TenantDashboard {
  tenant: {
    id: string;
    placeName: string;
    subdomain: string;
  };
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    pendingRegistrations: number;
  };
  recentEvents: Event[];
}

export const tenantService = {
  // Get tenant info
  getTenantInfo: async (subdomain: string): Promise<{ tenant: Tenant }> => {
    return apiRequest<{ tenant: Tenant }>(`/api/${subdomain}`);
  },

  // Get tenant events (public)
  getTenantEvents: async (
    subdomain: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
    }
  ): Promise<{ events: Event[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);

    const queryString = searchParams.toString();
    const endpoint = `/api/${subdomain}/events${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ events: Event[]; pagination: any }>(endpoint);
  },

  // Get tenant dashboard (admin only)
  getTenantDashboard: async (subdomain: string): Promise<TenantDashboard> => {
    return apiRequest<TenantDashboard>(`/api/${subdomain}/dashboard`);
  },

  // Get tenant admins (admin only)
  getTenantAdmins: async (subdomain: string): Promise<{ admins: any[] }> => {
    return apiRequest<{ admins: any[] }>(`/api/${subdomain}/admins`);
  },
};
