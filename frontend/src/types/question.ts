export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  ESSAY: 'ESSAY',
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export const QuestionLevel = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type QuestionLevel = typeof QuestionLevel[keyof typeof QuestionLevel];

export type QuestionOption = {
  id?: string;
  questionId?: string;
  content: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  content: string;
  type: QuestionType;
  level: QuestionLevel;
  questionBankId: string;
  createdAt: string;
  options: QuestionOption[];
  questionBank?: {
    id: string;
    name: string;
    course: {
      id: string;
      code: string;
      name: string;
    };
  };
};

export type CreateQuestionDto = {
  content: string;
  type: QuestionType;
  level: QuestionLevel;
  questionBankId: string;
  options?: Omit<QuestionOption, 'id' | 'questionId'>[];
};

export type UpdateQuestionDto = Partial<CreateQuestionDto>;
