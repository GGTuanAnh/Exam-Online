import { api } from './api';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types/course';

export const courseService = {
  async getAll(): Promise<Course[]> {
    const response = await api.get<any>('/courses'); // API response might be wrapped in { data: ..., meta: ... }
    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: string): Promise<Course> {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async create(data: CreateCourseDto): Promise<Course> {
    const response = await api.post<Course>('/courses', data);
    return response.data;
  },

  async update(id: string, data: UpdateCourseDto): Promise<Course> {
    const response = await api.patch<Course>(`/courses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },
};

