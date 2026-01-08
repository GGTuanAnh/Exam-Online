// backend/src/exam-sessions/dto/submit-exam.dto.ts
import { IsUUID, IsNotEmpty, IsObject, IsInt, Min } from 'class-validator';

export class SubmitExamDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>; // { "questionId": "optionId" hoac "text answer" }

  @IsInt()
  @Min(0)
  leaveScreenCount?: number = 0; // So lan roi tab (anti-cheat)
}
