// backend/src/notifications/dto/create-notification.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: string; // 'exam_upcoming', 'result_published', 'course_added', etc.

  @IsUUID()
  @IsOptional()
  userId?: string; // Gui cho 1 user cu the

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[]; // Hoac gui cho nhieu users
}
