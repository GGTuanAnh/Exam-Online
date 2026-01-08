// backend/src/question-banks/dto/create-question-bank.dto.ts
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateQuestionBankDto {
  @IsString({ message: 'Tên ngân hàng câu hỏi phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên ngân hàng câu hỏi không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @IsUUID('4', { message: 'ID môn học không hợp lệ' })
  @IsNotEmpty({ message: 'ID môn học không được để trống' })
  courseId: string;
}
