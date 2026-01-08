// backend/src/question-banks/question-banks.module.ts
import { Module } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service';
import { QuestionBanksController } from './question-banks.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [QuestionBanksController],
  providers: [QuestionBanksService, PrismaService],
  exports: [QuestionBanksService],
})
export class QuestionBanksModule {}
