// frontend/src/services/import.service.ts
import { api } from './api';

export const importService = {
  async importQuestions(questionBankId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionBankId', questionBankId);

    const response = await api.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60s timeout for large files
    });
    return response.data;
  },
  
  getErrorTemplateUrl() {
      // Just a helper if needed later
  }
};
