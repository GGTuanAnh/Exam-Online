import { api } from './api';
import type { QuestionBank, CreateQuestionBankDto, UpdateQuestionBankDto } from '../types/question-bank';

export const questionBankService = {
  async getAll(courseId?: string): Promise<QuestionBank[]> {
    const params = courseId ? { courseId } : {};
    const response = await api.get<QuestionBank[]>('/question-banks', { params });
    return response.data;
  },

  async getById(id: string): Promise<QuestionBank> {
    const response = await api.get<QuestionBank>(`/question-banks/${id}`);
    return response.data;
  },

  async create(data: CreateQuestionBankDto): Promise<QuestionBank> {
    const response = await api.post<QuestionBank>('/question-banks', data);
    return response.data;
  },

  async update(id: string, data: UpdateQuestionBankDto): Promise<QuestionBank> {
    const response = await api.patch<QuestionBank>(`/question-banks/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/question-banks/${id}`);
  },
};
