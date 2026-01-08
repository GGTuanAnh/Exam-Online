// backend/src/questions/dto/create-question.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, QuestionLevel } from '@prisma/client';

class QuestionOptionDto {
  @IsString({ message: 'Nội dung đáp án phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung đáp án không được để trống' })
  content: string;

  @IsBoolean({ message: 'isCorrect phải là boolean' })
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString({ message: 'Nội dung câu hỏi phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  content: string;

  @IsEnum(QuestionType, { message: 'Loại câu hỏi không hợp lệ' })
  type: QuestionType;

  @IsEnum(QuestionLevel, { message: 'Độ khó không hợp lệ' })
  level: QuestionLevel;

  @IsUUID('4', { message: 'ID ngân hàng câu hỏi không hợp lệ' })
  @IsNotEmpty({ message: 'ID ngân hàng câu hỏi không được để trống' })
  questionBankId: string;

  // Options - bat buoc voi SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
  @ValidateIf((o) => o.type !== QuestionType.ESSAY)
  @IsArray({ message: 'Danh sách đáp án phải là mảng' })
  @ArrayMinSize(2, { message: 'Phải có ít nhất 2 đáp án' })
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];
}
