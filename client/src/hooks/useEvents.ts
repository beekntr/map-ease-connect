import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';
import { toast } from '@/hooks/use-toast';

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  byTenant: (subdomain: string) => [...eventKeys.all, 'tenant', subdomain] as const,
  detail: (subdomain: string, id: string) => [...eventKeys.byTenant(subdomain), id] as const,
  registrations: (subdomain: string, id: string) => [...eventKeys.detail(subdomain, id), 'registrations'] as const,
  map: (subdomain: string, eventId: string, userId: string) => 
    [...eventKeys.detail(subdomain, eventId), 'map', userId] as const,
};

// Get event details hook
export const useGetEventDetails = (subdomain: string, eventId: string) => {
  return useQuery({
    queryKey: eventKeys.detail(subdomain, eventId),
    queryFn: () => eventService.getEventDetails(subdomain, eventId),
    enabled: !!subdomain && !!eventId,
  });
};

// Get event registrations hook
export const useGetEventRegistrations = (
  subdomain: string,
  eventId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: [...eventKeys.registrations(subdomain, eventId), params],
    queryFn: () => eventService.getEventRegistrations(subdomain, eventId, params),
    enabled: !!subdomain && !!eventId,
  });
};

// Get map for user hook
export const useGetMapForUser = (
  subdomain: string,
  eventId: string,
  userId: string
) => {
  return useQuery({
    queryKey: eventKeys.map(subdomain, eventId, userId),
    queryFn: () => eventService.getMapForUser(subdomain, eventId, userId),
    enabled: !!subdomain && !!eventId && !!userId,
  });
};

// Create event mutation
export const useCreateEvent = (subdomain: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => eventService.createEvent(subdomain, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.byTenant(subdomain) });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });
};

// Register for event mutation
export const useRegisterForEvent = (subdomain: string, eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => eventService.registerForEvent(subdomain, eventId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.registrations(subdomain, eventId) 
      });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });
};

// Approve user registration mutation
export const useApproveUserRegistration = (subdomain: string, eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => 
      eventService.approveUserRegistration(subdomain, eventId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.registrations(subdomain, eventId) 
      });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      });
    },
  });
};

// Reject user registration mutation
export const useRejectUserRegistration = (subdomain: string, eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => 
      eventService.rejectUserRegistration(subdomain, eventId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.registrations(subdomain, eventId) 
      });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration",
        variant: "destructive",
      });
    },
  });
};

// Scan QR mutation
export const useScanQR = (subdomain: string, eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { qrCode: string }) => 
      eventService.scanQR(subdomain, eventId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.registrations(subdomain, eventId) 
      });
      toast({
        title: data.valid ? "Valid QR Code" : "Invalid QR Code",
        description: data.message,
        variant: data.valid ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to scan QR code",
        variant: "destructive",
      });
    },
  });
};

// Update event mutation
export const useUpdateEvent = (subdomain: string, eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => eventService.updateEvent(subdomain, eventId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.detail(subdomain, eventId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.byTenant(subdomain) 
      });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });
};

// Delete event mutation
export const useDeleteEvent = (subdomain: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventService.deleteEvent(subdomain, eventId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.byTenant(subdomain) 
      });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });
};
