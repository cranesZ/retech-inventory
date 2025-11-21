import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signin as apiSignin, signup as apiSignup, signout as apiSignout, getProfile } from '../services/api';
import type { SigninData, SignupData, UserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: SigninData) => Promise<void>;
  register: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const profile = await getProfile();
      setUser(profile);
      setToken(storedToken);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to verify authentication:', error);
      // Token is invalid, clear everything
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  // Login function
  const login = async (data: SigninData) => {
    try {
      const response = await apiSignin(data);

      // Extract access token from session
      const accessToken = response.session?.access_token;
      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Store token temporarily
      localStorage.setItem('authToken', accessToken);
      setToken(accessToken);

      // Fetch full profile with role
      const profile = await getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  };

  // Register function
  const register = async (data: SignupData) => {
    try {
      const response = await apiSignup(data);

      // Extract access token from session (if available)
      const accessToken = response.session?.access_token;

      if (accessToken) {
        // Store token temporarily
        localStorage.setItem('authToken', accessToken);
        setToken(accessToken);

        // Fetch full profile with role
        const profile = await getProfile();
        localStorage.setItem('user', JSON.stringify(profile));
        setUser(profile);
      } else {
        // No session (email confirmation required)
        throw new Error('Please check your email to confirm your account');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    await apiSignout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
