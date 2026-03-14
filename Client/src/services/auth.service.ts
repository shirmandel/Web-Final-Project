import api from './api';

export interface User {
  _id: string;
  email: string;
  username: string;
  profileImage: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/register', { email, username, password });
    this.saveTokens(data);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/login', { email, password });
    this.saveTokens(data);
    return data;
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/google', { credential });
    this.saveTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  saveTokens(data: AuthResponse): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
