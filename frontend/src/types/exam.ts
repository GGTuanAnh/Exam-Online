export interface ExamQuestion {
  questionId: string;
  point?: number;
  order?: number;
}

export interface CreateExamDto {
  title: string;
  description?: string;
  duration: number;
  courseId: string;
  openTime?: string;
  closeTime?: string;
  maxRetake?: number;
  randomizeQuestions?: boolean;
  enableAntiCheat?: boolean;
  questions: ExamQuestion[];
}

export interface UpdateExamDto extends Partial<CreateExamDto> {}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number;
  courseId: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  questions: Array<{
    questionId: string;
    point: number;
    question: {
      content: string;
      type: string;
    };
  }>;
  openTime?: string;
  closeTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMEOUT';
  currentAnswers: Record<string, any>;
  remainingTime: number; // in minutes
  exam: {
    id: string;
    title: string;
    duration: number;
    description?: string;
    enableAntiCheat?: boolean;
  };
  questions: Array<{
    id: string; // Relation ID
    point: number;
    question: {
      id: string;
      content: string;
      type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
      options: Array<{
        id: string;
        text: string;
      }>;
    };
  }>;
}

export interface ExamResult {
  id: string;
  score: number;
  isPassed: boolean;
  completedAt: string; // or submittedAt
  submittedAt?: string;
  status: 'PASSED' | 'FAILED' | 'PENDING' | 'GRADED';
  leaveScreenCount?: number; // Anti-cheat: số lần rời tab
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  session?: {
      exam: {
        id: string;
        title: string;
        course: {
            id: string;
            name: string;
            code: string;
        };
      };
  };
  // Fallback for flat structure if used elsewhere
  exam?: {
    title: string;
    passingScore: number;
    course: {
      name: string;
    };
  };
}
