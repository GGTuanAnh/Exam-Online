// backend/src/exam-sessions/exam-sessions.module.ts
import { Module } from '@nestjs/common';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsController } from './exam-sessions.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExamSessionsController],
  providers: [ExamSessionsService, PrismaService],
})
export class ExamSessionsModule {}
