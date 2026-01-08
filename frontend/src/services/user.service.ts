import { api } from './api';
import type { User, UserSearchResponse } from '../types/user';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async searchByEmail(email: string): Promise<UserSearchResponse> {
    const response = await api.get<UserSearchResponse>('/users/search', {
      params: { email }
    });
    return response.data;
  },
  
  async updateRole(id: string, role: 'ADMIN' | 'USER') {
    return api.patch(`/users/${id}/role`, { role });
  },

  async delete(id: string) {
    return api.delete(`/users/${id}`);
  }
};
