import { api } from './api';
import type { Question, CreateQuestionDto, UpdateQuestionDto, QuestionType } from '../types/question';

export const questionService = {
  async getAll(questionBankId?: string, type?: QuestionType, level?: string): Promise<Question[]> {
    const params: any = {};
    if (questionBankId) params.questionBankId = questionBankId;
    if (type) params.type = type;
    if (level) params.level = level;

    const response = await api.get<Question[]>('/questions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Question> {
    const response = await api.get<Question>(`/questions/${id}`);
    return response.data;
  },

  async create(data: CreateQuestionDto): Promise<Question> {
    const response = await api.post<Question>('/questions', data);
    return response.data;
  },

  async update(id: string, data: UpdateQuestionDto): Promise<Question> {
    const response = await api.patch<Question>(`/questions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  },

  async importQuestions(questionBankId: string, file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionBankId', questionBankId);

    const response = await api.post<{ success: number; failed: number; errors: string[] }>(
      '/questions/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
