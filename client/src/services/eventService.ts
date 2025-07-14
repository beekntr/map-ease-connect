import { apiRequest } from '@/lib/api';
import type { Event, EventUser, PaginatedResponse } from '@/lib/api';

export interface CreateEventData {
  eventName: string;
  locationName: string;
  eventType?: 'OPEN' | 'PRIVATE';
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface RegisterForEventData {
  name: string;
  email: string;
  phone?: string;
}

export interface ScanQRData {
  qrCode: string;
}

export const eventService = {
  // Create event (tenant admin only)
  createEvent: async (
    subdomain: string,
    data: CreateEventData
  ): Promise<{
    message: string;
    event: Event;
    publicUrl: string;
  }> => {
    return apiRequest<{
      message: string;
      event: Event;
      publicUrl: string;
    }>(`/api/${subdomain}/event/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get event details (public)
  getEventDetails: async (
    subdomain: string,
    eventId: string
  ): Promise<{ event: Event }> => {
    return apiRequest<{ event: Event }>(`/api/${subdomain}/event/${eventId}`);
  },

  // Register for event (public)
  registerForEvent: async (
    subdomain: string,
    eventId: string,
    data: RegisterForEventData
  ): Promise<{
    message: string;
    registration: EventUser;
  }> => {
    return apiRequest<{
      message: string;
      registration: EventUser;
    }>(`/api/${subdomain}/event/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get event registrations (tenant admin only)
  getEventRegistrations: async (
    subdomain: string,
    eventId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<{ registrations: EventUser[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/api/${subdomain}/event/${eventId}/registrations${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ registrations: EventUser[]; pagination: any }>(endpoint);
  },

  // Approve user registration (tenant admin only)
  approveUserRegistration: async (
    subdomain: string,
    eventId: string,
    userId: string
  ): Promise<{
    message: string;
    eventUser: EventUser;
    qrCodeUrl?: string;
  }> => {
    return apiRequest<{
      message: string;
      eventUser: EventUser;
      qrCodeUrl?: string;
    }>(`/api/${subdomain}/event/${eventId}/approve-user/${userId}`, {
      method: 'POST',
    });
  },

  // Reject user registration (tenant admin only)
  rejectUserRegistration: async (
    subdomain: string,
    eventId: string,
    userId: string
  ): Promise<{
    message: string;
    eventUser: EventUser;
  }> => {
    return apiRequest<{
      message: string;
      eventUser: EventUser;
    }>(`/api/${subdomain}/event/${eventId}/reject-user/${userId}`, {
      method: 'POST',
    });
  },

  // Scan QR code (tenant admin only)
  scanQR: async (
    subdomain: string,
    eventId: string,
    data: ScanQRData
  ): Promise<{
    message: string;
    eventUser: EventUser;
    valid: boolean;
  }> => {
    return apiRequest<{
      message: string;
      eventUser: EventUser;
      valid: boolean;
    }>(`/api/${subdomain}/event/${eventId}/scan-qr`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get map for approved user
  getMapForUser: async (
    subdomain: string,
    eventId: string,
    userId: string
  ): Promise<{
    svgContent: string;
    tenant: any;
    event: Event;
  }> => {
    return apiRequest<{
      svgContent: string;
      tenant: any;
      event: Event;
    }>(`/api/${subdomain}/event/${eventId}/map/${userId}`);
  },

  // Update event (tenant admin only)
  updateEvent: async (
    subdomain: string,
    eventId: string,
    data: Partial<CreateEventData>
  ): Promise<{
    message: string;
    event: Event;
  }> => {
    return apiRequest<{
      message: string;
      event: Event;
    }>(`/api/${subdomain}/event/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete event (tenant admin only)
  deleteEvent: async (
    subdomain: string,
    eventId: string
  ): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/${subdomain}/event/${eventId}`, {
      method: 'DELETE',
    });
  },
};
