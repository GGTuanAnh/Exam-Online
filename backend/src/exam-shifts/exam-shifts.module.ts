import { Module } from '@nestjs/common';
import { ExamShiftsService } from './exam-shifts.service';
import { ExamShiftsController } from './exam-shifts.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExamShiftsController],
  providers: [ExamShiftsService, PrismaService],
  exports: [ExamShiftsService],
})
export class ExamShiftsModule { }
