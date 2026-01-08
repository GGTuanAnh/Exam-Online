// backend/src/exams/dto/create-exam.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  Min, 
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsUUID
} from 'class-validator';
import { Type } from 'class-transformer';

class ExamQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  point?: number = 1.0; // Diem mac dinh cho moi cau

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number; // Thu tu cau hoi (neu khong random)
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  duration: number; // Thoi gian lam bai (phut)

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  // Thoi gian mo/dong de thi
  @IsDateString()
  @IsOptional()
  openTime?: string;

  @IsDateString()
  @IsOptional()
  closeTime?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxRetake?: number = 1; // So lan thi toi da

  // Cau hinh nang cao
  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean = false; // Dao cau hoi

  @IsBoolean()
  @IsOptional()
  enableAntiCheat?: boolean = false; // Chong gian lan

  // Danh sach cau hoi trong de thi
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionDto)
  @ArrayMinSize(1, { message: 'De thi phai co it nhat 1 cau hoi' })
  questions: ExamQuestionDto[];
}
