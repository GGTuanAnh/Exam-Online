// backend/src/exam-sessions/dto/start-exam.dto.ts
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartExamDto {
  @IsUUID()
  @IsOptional()
  examId?: string;

  @IsUUID()
  @IsOptional()
  examShiftId?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
