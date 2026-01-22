import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateExamShiftDto } from './dto/create-exam-shift.dto';
import { UpdateExamShiftDto } from './dto/update-exam-shift.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExamShiftsService {
  constructor(private prisma: PrismaService) { }

  async create(createExamShiftDto: CreateExamShiftDto) {
    const { startTime, endTime, examId } = createExamShiftDto;

    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Validate exam exists
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.prisma.examShift.create({
      data: {
        title: createExamShiftDto.title,
        examId: createExamShiftDto.examId,
        startTime: new Date(createExamShiftDto.startTime),
        endTime: new Date(createExamShiftDto.endTime),
        password: createExamShiftDto.password,
        isActive: createExamShiftDto.isActive ?? true,
      },
    });
  }

  findAll(examId?: string) {
    const where = examId ? { examId } : {};
    return this.prisma.examShift.findMany({
      where,
      include: {
        exam: {
          include: {
            course: true,
          },
        },
        _count: {
          select: { sessions: true },
        }, // Count active sessions in this shift
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const shift = await this.prisma.examShift.findUnique({
      where: { id },
      include: {
        exam: true,
      },
    });
    if (!shift) throw new NotFoundException('Exam Shift not found');
    return shift;
  }

  update(id: string, updateExamShiftDto: UpdateExamShiftDto) {
    return this.prisma.examShift.update({
      where: { id },
      data: {
        ...updateExamShiftDto,
        startTime: updateExamShiftDto.startTime ? new Date(updateExamShiftDto.startTime) : undefined,
        endTime: updateExamShiftDto.endTime ? new Date(updateExamShiftDto.endTime) : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.examShift.delete({
      where: { id },
    });
  }
}
