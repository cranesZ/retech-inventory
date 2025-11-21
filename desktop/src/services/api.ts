import type { Device } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Helper to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  const json = await response.json();
  // Extract data from success wrapper
  return json.data || json;
}

// Generic request helper with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

// ============================================
// Authentication API
// ============================================

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  } | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile?: {
    role: string;
    full_name: string;
    is_active: boolean;
    two_factor_enabled: boolean;
  };
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function signin(data: SigninData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function signout(): Promise<void> {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

export async function getProfile(): Promise<UserProfile> {
  const response = await apiRequest<{ user: any; profile: any }>('/auth/profile');

  // Transform nested backend response to flattened frontend structure
  return {
    id: response.user.id,
    email: response.user.email,
    full_name: response.profile?.full_name || response.user.user_metadata?.full_name || '',
    role: response.profile?.role || 'user',
    profile: response.profile
  };
}

// ============================================
// Devices API
// ============================================

export interface DeviceCreateData {
  manufacturer: string;
  model: string;
  variant?: string;
  network?: string;
  capacity?: string;
  color?: string;
  esn?: string;
  imei?: string;
  quantity: number;
  grade?: string;
  damages?: string;
  notes?: string;
  pricePaid?: number;
  status: string;
  location?: string;
  battery?: string;
}

export interface DeviceUpdateData extends Partial<DeviceCreateData> {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchDevices(): Promise<Device[]> {
  return apiRequest<Device[]>('/devices');
}

export async function createDevice(data: DeviceCreateData): Promise<Device> {
  return apiRequest<Device>('/devices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDevice(id: string, data: DeviceUpdateData): Promise<Device> {
  return apiRequest<Device>(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDevice(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/devices/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// ADMIN API FUNCTIONS
// ============================================

export async function getAllUsers(): Promise<any> {
  return apiRequest('/admin/users');
}

export async function createUser(data: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}): Promise<any> {
  return apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(userId: string, role: string): Promise<any> {
  return apiRequest(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function activateUser(userId: string): Promise<any> {
  return apiRequest(`/admin/users/${userId}/activate`, {
    method: 'PUT',
  });
}

export async function deactivateUser(userId: string): Promise<any> {
  return apiRequest(`/admin/users/${userId}/deactivate`, {
    method: 'PUT',
  });
}

export async function deleteUser(userId: string): Promise<any> {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function getAdminStats(): Promise<any> {
  return apiRequest('/admin/stats');
}

// ============================================
// Export all API functions
// ============================================

export const api = {
  // Auth
  signup,
  signin,
  signout,
  getProfile,

  // Devices
  fetchDevices,
  createDevice,
  updateDevice,
  deleteDevice,
};

export default api;
