// backend/src/exam-results/dto/grade-essay.dto.ts
import { IsUUID, IsNotEmpty, IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class GradeEssayDto {
  @IsUUID()
  @IsNotEmpty()
  resultDetailId: string; // ID cua ExamResultDetail can cham

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pointEarned: number; // Diem admin cho

  @IsString()
  @IsOptional()
  feedback?: string; // Nhan xet cua admin
}
