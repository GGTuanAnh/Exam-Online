import { api } from './api';

export interface ExamShift {
    id: string;
    title: string;
    examId: string;
    startTime: string;
    endTime: string;
    password?: string;
    isActive: boolean;
    _count?: {
        sessions: number;
    };
    exam?: {
        title: string;
        duration: number;
        course: {
            name: string;
            code?: string;
        };
    };
}

export interface CreateExamShiftDto {
    title: string;
    examId: string;
    startTime: string;
    endTime: string;
    password?: string;
    isActive?: boolean;
}

export const examShiftService = {
    getAll: async (examId?: string) => {
        const params = examId ? { examId } : {};
        const response = await api.get<ExamShift[]>('/exam-shifts', { params });
        return response.data;
    },

    create: async (data: CreateExamShiftDto) => {
        const response = await api.post<ExamShift>('/exam-shifts', data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/exam-shifts/${id}`);
    },

    update: async (id: string, data: Partial<CreateExamShiftDto>) => {
        const response = await api.patch<ExamShift>(`/exam-shifts/${id}`, data);
        return response.data;
    }
};
