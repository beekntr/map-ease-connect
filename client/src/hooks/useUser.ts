import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { toast } from '@/hooks/use-toast';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  dashboard: () => [...userKeys.all, 'dashboard'] as const,
  events: () => [...userKeys.all, 'events'] as const,
};

// Get user profile hook
export const useGetUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user dashboard hook
export const useGetUserDashboard = () => {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: () => userService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get user's registered events hook
export const useGetUserEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: [...userKeys.events(), params],
    queryFn: () => userService.getRegisteredEvents(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Update user profile mutation
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};
