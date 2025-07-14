// API configuration and types
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bck.mapease.akshatmehta.com';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'GUEST';
  isActive: boolean;
  createdAt: string;
}

// Tenant types
export interface Tenant {
  id: string;
  placeName: string;
  subdomain: string;
  svgPath?: string;
  isActive: boolean;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  admins?: TenantAdmin[];
  _count?: {
    events: number;
  };
}

export interface TenantAdmin {
  user: User;
}

// Event types
export interface Event {
  id: string;
  eventName: string;
  locationName: string;
  eventType: 'OPEN' | 'PRIVATE';
  description?: string;
  startDate?: string;
  endDate?: string;
  shareLink: string;
  isActive: boolean;
  createdAt: string;
  tenantId: string;
  tenant?: {
    placeName: string;
    subdomain: string;
  };
  _count?: {
    eventUsers: number;
  };
}

// Event User types
export interface EventUser {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  qrCode?: string;
  qrCodeUrl?: string;
  scannedAt?: string;
  createdAt: string;
  user?: User;
  event?: Event;
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API helper function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || `HTTP ${response.status}`,
      errorData
    );
  }

  return response.json();
};

// Multipart form data helper
export const apiRequestFormData = async <T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: formData,
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || `HTTP ${response.status}`,
      errorData
    );
  }

  return response.json();
};
