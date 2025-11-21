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
  return response.json();
}

// Generic request helper with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
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
  return apiRequest<UserProfile>('/auth/profile');
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
