// backend/src/exam-results/exam-results.module.ts
import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { ExamResultsController } from './exam-results.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExamResultsController],
  providers: [ExamResultsService, PrismaService],
})
export class ExamResultsModule {}
