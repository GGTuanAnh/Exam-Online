// backend/src/exam-sessions/dto/save-answer.dto.ts
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SaveAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>; // { "questionId": "optionId" hoac "text answer" }
}
