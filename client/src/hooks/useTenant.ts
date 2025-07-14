import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/services/tenantService';
import { toast } from '@/hooks/use-toast';

// Query keys
export const tenantKeys = {
  all: ['tenant'] as const,
  detail: (subdomain: string) => [...tenantKeys.all, subdomain] as const,
  events: (subdomain: string) => [...tenantKeys.detail(subdomain), 'events'] as const,
  dashboard: (subdomain: string) => [...tenantKeys.detail(subdomain), 'dashboard'] as const,
  admins: (subdomain: string) => [...tenantKeys.detail(subdomain), 'admins'] as const,
};

// Get tenant info hook
export const useGetTenantInfo = (subdomain: string) => {
  return useQuery({
    queryKey: tenantKeys.detail(subdomain),
    queryFn: () => tenantService.getTenantInfo(subdomain),
    enabled: !!subdomain,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get tenant events hook
export const useGetTenantEvents = (
  subdomain: string,
  params?: {
    page?: number;
    limit?: number;
    type?: string;
  }
) => {
  return useQuery({
    queryKey: [...tenantKeys.events(subdomain), params],
    queryFn: () => tenantService.getTenantEvents(subdomain, params),
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000,
  });
};

// Get tenant dashboard hook
export const useGetTenantDashboard = (subdomain: string) => {
  return useQuery({
    queryKey: tenantKeys.dashboard(subdomain),
    queryFn: () => tenantService.getTenantDashboard(subdomain),
    enabled: !!subdomain,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get tenant admins hook
export const useGetTenantAdmins = (subdomain: string) => {
  return useQuery({
    queryKey: tenantKeys.admins(subdomain),
    queryFn: () => tenantService.getTenantAdmins(subdomain),
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000,
  });
};
