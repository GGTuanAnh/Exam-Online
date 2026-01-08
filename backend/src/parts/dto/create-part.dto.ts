// backend/src/parts/dto/create-part.dto.ts
import { IsString, IsInt, IsOptional, IsBoolean, IsDateString, IsIn, Min, Max } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  duration: number; // Thoi gian lam bai (phut)

  @IsString()
  courseId: string;

  @IsOptional()
  @IsString()
  questionBankId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  score?: number; // Diem toi da

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetake?: number; // So lan lam lai

  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAntiCheat?: boolean;

  @IsOptional()
  @IsBoolean()
  enableTabWarning?: boolean;

  @IsOptional()
  @IsDateString()
  openTime?: string; // ISO string

  @IsOptional()
  @IsDateString()
  closeTime?: string; // ISO string

  @IsOptional()
  @IsBoolean()
  showAnswerAfterSubmit?: boolean;

  @IsOptional()
  @IsIn(['latest', 'highest', 'average'])
  scoringMode?: string;
}
