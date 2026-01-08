import { IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Mã môn học không được để trống' })
  code: string;

  @IsNotEmpty({ message: 'Tên môn học không được để trống' })
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;
}
