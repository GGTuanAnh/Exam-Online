import { PartialType } from '@nestjs/swagger';
import { CreateExamShiftDto } from './create-exam-shift.dto';

export class UpdateExamShiftDto extends PartialType(CreateExamShiftDto) {}
