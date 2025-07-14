import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  tenants: () => [...adminKeys.all, 'tenants'] as const,
  tenant: (id: string) => [...adminKeys.tenants(), id] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
};

// Get tenants hook
export const useGetTenants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...adminKeys.tenants(), params],
    queryFn: () => adminService.getTenants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get users hook
export const useGetUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  return useQuery({
    queryKey: [...adminKeys.users(), params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Get dashboard stats hook
export const useGetAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create tenant mutation
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tenant",
        variant: "destructive",
      });
    },
  });
};

// Assign tenant admin mutation
export const useAssignTenantAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.assignTenantAdmin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tenant admin",
        variant: "destructive",
      });
    },
  });
};

// Update tenant mutation
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updateTenant(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tenant",
        variant: "destructive",
      });
    },
  });
};

// Delete tenant mutation
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.deleteTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tenant",
        variant: "destructive",
      });
    },
  });
};
