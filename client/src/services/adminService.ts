import { apiRequest, apiRequestFormData } from '@/lib/api';
import type { Tenant, User, PaginatedResponse } from '@/lib/api';

export interface CreateTenantData {
  placeName: string;
  subdomain: string;
  svgMap?: File;
}

export interface AssignTenantAdminData {
  email: string;
  tenantId: string;
}

export interface AdminDashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalEvents: number;
  activeUsers: number;
  activeTenants: number;
  pendingRegistrations: number;
}

export const adminService = {
  // Get all tenants
  getTenants: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ tenants: Tenant[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/tenants${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ tenants: Tenant[]; pagination: any }>(endpoint);
  },

  // Create new tenant
  createTenant: async (data: CreateTenantData): Promise<{ message: string; tenant: Tenant }> => {
    const formData = new FormData();
    formData.append('placeName', data.placeName);
    formData.append('subdomain', data.subdomain);
    if (data.svgMap) {
      formData.append('svgMap', data.svgMap);
    }

    return apiRequestFormData<{ message: string; tenant: Tenant }>(
      '/api/admin/create-tenant',
      formData
    );
  },

  // Assign tenant admin
  assignTenantAdmin: async (data: AssignTenantAdminData): Promise<{
    message: string;
    user: User;
    tenant: Tenant;
  }> => {
    return apiRequest<{
      message: string;
      user: User;
      tenant: Tenant;
    }>('/api/admin/assign-tenant-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{ users: User[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ users: User[]; pagination: any }>(endpoint);
  },

  // Update tenant
  updateTenant: async (
    id: string,
    data: {
      placeName?: string;
      subdomain?: string;
      isActive?: boolean;
      svgMap?: File;
    }
  ): Promise<{ message: string; tenant: Tenant }> => {
    const formData = new FormData();
    if (data.placeName) formData.append('placeName', data.placeName);
    if (data.subdomain) formData.append('subdomain', data.subdomain);
    if (typeof data.isActive === 'boolean') formData.append('isActive', data.isActive.toString());
    if (data.svgMap) formData.append('svgMap', data.svgMap);

    return apiRequestFormData<{ message: string; tenant: Tenant }>(
      `/api/admin/tenants/${id}`,
      formData,
      { method: 'PUT' }
    );
  },

  // Delete tenant
  deleteTenant: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/admin/tenants/${id}`, {
      method: 'DELETE',
    });
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    return apiRequest<AdminDashboardStats>('/api/admin/dashboard/stats');
  },
};
