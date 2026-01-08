export type QuestionBank = {
  id: string;
  name: string;
  description?: string;
  courseId: string;
  course?: {
    id: string;
    code: string;
    name: string;
  };
  totalQuestions?: number;
  createdAt: string;
};

export type CreateQuestionBankDto = {
  name: string;
  description?: string;
  courseId: string;
};

export type UpdateQuestionBankDto = Partial<CreateQuestionBankDto>;
