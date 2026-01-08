// backend/src/exam-sessions/dto/start-exam.dto.ts
import { IsUUID, IsNotEmpty } from 'class-validator';

export class StartExamDto {
  @IsUUID()
  @IsNotEmpty()
  examId: string;
}
