import { api } from './api';
import type { Exam, CreateExamDto, UpdateExamDto, ExamSession, ExamResult } from '../types/exam';

export * from '../types/exam';

export const examService = {
  // --- Admin Methods ---
  async getAllExams(courseId?: string) {
    const params = courseId ? { courseId } : {};
    const response = await api.get<Exam[]>('/exams', { params });
    return response.data;
  },

  async getExamById(id: string) {
    const response = await api.get<Exam>(`/exams/${id}`);
    return response.data;
  },

  async createExam(data: CreateExamDto) {
    const response = await api.post<Exam>('/exams', data);
    return response.data;
  },

  async updateExam(id: string, data: UpdateExamDto) {
    const response = await api.patch<Exam>(`/exams/${id}`, data);
    return response.data;
  },

  async deleteExam(id: string) {
    await api.delete(`/exams/${id}`);
  },

  async getAllExamResults(params?: { examId?: string; userId?: string; status?: string }) {
    const response = await api.get<ExamResult[]>('/exam-results', { params });
    return response.data;
  },

  async getAllExamSessions(params?: { examId?: string; userId?: string; status?: string }) {
    const response = await api.get<any[]>('/exam-sessions', { params });
    return response.data;
  },

  // --- User Methods ---

  // Get list of available exams
  async getAvailableExams() {
    const response = await api.get<Exam[]>('/exams?available=true');
    return response.data;
  },

  // Get user's exam results
  // Kept for backward compatibility if used, but getMyExamResults is preferred
  async getMyResults() {
    const response = await api.get<any[]>('/exam-sessions/my-sessions');
    return response.data;
  },

  async getMyExamResults() {
    // Call the correct endpoint for students
    const response = await api.get<any[]>('/exam-sessions/my-sessions');
    // Map sessions to ExamResult structure for frontend compatibility
    // The backend returns Session with nested Result and Exam
    return response.data.map((session: any) => {
        // If session has no result (e.g. IN_PROGRESS), we might filter it out or show as incomplete
        // Assuming we only want completed results here or we adapt UI
        const result = session.result || {};
        return {
            id: result.id || session.id, // Prefer result ID
            score: result.score || 0,
            isPassed: result.status === 'PASSED',
            completedAt: session.endTime || result.submittedAt,
            submittedAt: result.submittedAt,
            status: result.status || session.status, // PASSED/FAILED or COMPLETED
            exam: session.exam, // Exam details attached
            user: session.user // If available
        } as ExamResult;
    }).filter((r: ExamResult) => r.status && !['IN_PROGRESS', 'NOT_STARTED'].includes(String(r.status))); // Optional: hide incomplete sessions
  },

  // Start an exam session
  async startExam(examId: string) {
    const response = await api.post<ExamSession>('/exam-sessions/start', { examId });
    return response.data;
  },

  // Save answer progressively
  async saveAnswer(sessionId: string, currentAnswers: Record<string, any>) {
    const response = await api.post('/exam-sessions/save-answer', {
      sessionId,
      currentAnswers,
    });
    return response.data;
  },

  // Submit exam
  async submitExam(sessionId: string, answers: Record<string, any>, leaveScreenCount: number = 0) {
    const response = await api.post('/exam-sessions/submit', {
      sessionId,
      answers,
      leaveScreenCount,
    });
    return response.data;
  },

  // Get session details (re-join)
  async getSession(sessionId: string) {
    const response = await api.get<ExamSession>(`/exam-sessions/${sessionId}`);
    return response.data;
  }
};
