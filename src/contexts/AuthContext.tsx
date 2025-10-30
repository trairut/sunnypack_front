import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email?: string | null;
  full_name?: string | null;
  role: 'superadmin' | 'admin' | 'user';
  user_type: 'warehouse' | 'company' | 'shop';
  is_active: boolean;
  created_at: string;
  warehouse_id?: number | null;
  company_id?: number | null;
  shop_id?: number | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (() => {
  const value = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
  return value.replace(/\/+$/, '');
})();
const USER_STORAGE_KEY = 'sunnypack_user';
const TOKEN_STORAGE_KEY = 'sunnypack_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const fetchProfile = useCallback(async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch user profile from server.');
    }

    const profile: User = await response.json();
    setUser(profile);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) {
      return;
    }

    setToken(savedToken);

    const savedUserRaw = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUserRaw) {
      try {
        const parsedUser: User = JSON.parse(savedUserRaw);
        setUser(parsedUser);
        return;
      } catch {
        clearSession();
      }
    }

    fetchProfile(savedToken).catch(() => {
      clearSession();
    });
  }, [clearSession, fetchProfile]);

  const logout = useCallback(() => {
    clearSession();
    navigate('/auth');
  }, [clearSession, navigate]);

  const login = useCallback(
    async (username: string, password: string) => {
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message =
            (errorData && (errorData.detail || errorData.message)) ||
            'Login failed. Please check your username or password.';
          throw new Error(message);
        }

        const tokenData: { access_token: string; token_type: string } = await response.json();
        const accessToken = tokenData.access_token;

        setToken(accessToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);

        await fetchProfile(accessToken);
        navigate('/dashboard');
      } catch (error) {
        clearSession();
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unexpected error occurred while logging in.');
      }
    },
    [clearSession, fetchProfile, navigate]
  );

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    return response.ok;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
