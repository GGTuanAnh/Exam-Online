// backend/src/question-banks/dto/update-question-bank.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionBankDto } from './create-question-bank.dto';

export class UpdateQuestionBankDto extends PartialType(CreateQuestionBankDto) {}
