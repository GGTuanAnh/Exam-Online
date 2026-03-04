import { api } from './api';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    avatar?: string;
  };
}

export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
};

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      sessionStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        sessionStorage.setItem('refresh_token', response.data.refresh_token);
      }
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  loginWithGoogle() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  handleCallback(token: string, user: string, refreshToken?: string) {
    if (token && user) {
      sessionStorage.setItem('access_token', token);
      if (refreshToken) {
        sessionStorage.setItem('refresh_token', refreshToken);
      }

      // User string from backend is likely base64url encoded
      // We need to decode it properly
      try {
        // Base64Url to Base64 (replace - with +, _ with /)
        const base64 = user.replace(/-/g, '+').replace(/_/g, '/');
        const userJson = atob(base64);
        sessionStorage.setItem('user', userJson);
        return true;
      } catch (e) {
        console.error('Error decoding user data', e);
        return false;
      }
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return sessionStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
