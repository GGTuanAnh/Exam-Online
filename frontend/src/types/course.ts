export type Course = {
  id: string;
  code: string;
  name: string;
  credits: number | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseDto = {
  code: string;
  name: string;
  credits?: number;
  description?: string;
};

export type UpdateCourseDto = Partial<CreateCourseDto>;
