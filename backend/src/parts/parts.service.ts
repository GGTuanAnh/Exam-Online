// backend/src/parts/parts.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ERROR_MESSAGES } from '../common/constants/messages.constants';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async create(createPartDto: CreatePartDto) {
    // Kiem tra course ton tai
    const course = await this.prisma.course.findUnique({
      where: { id: createPartDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
    }

    // Kiem tra questionBank neu co
    if (createPartDto.questionBankId) {
      const questionBank = await this.prisma.questionBank.findUnique({
        where: { id: createPartDto.questionBankId },
      });
      if (!questionBank) {
        throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
      }
      // Kiem tra questionBank phai thuoc course
      if (questionBank.courseId !== createPartDto.courseId) {
        throw new BadRequestException(ERROR_MESSAGES.QUESTION_BANK_NOT_BELONG_COURSE);
      }
    }

    // Validate openTime < closeTime
    if (createPartDto.openTime && createPartDto.closeTime) {
      if (new Date(createPartDto.openTime) >= new Date(createPartDto.closeTime)) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_TIME_RANGE);
      }
    }

    return this.prisma.part.create({
      data: createPartDto,
      include: {
        course: { select: { id: true, code: true, name: true } },
        questionBank: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { course: { name: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    return this.prisma.part.findMany({
      where,
      include: {
        course: { select: { id: true, code: true, name: true } },
        questionBank: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, code: true, name: true } },
        questionBank: {
          select: {
            id: true,
            name: true,
            questions: {
              select: {
                id: true,
                content: true,
                type: true,
                level: true,
                options: true,
              },
            },
          },
        },
      },
    });

    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    return part;
  }

  async findByCourse(courseId: string) {
    return this.prisma.part.findMany({
      where: { courseId },
      include: {
        course: { select: { id: true, code: true, name: true } },
        questionBank: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updatePartDto: UpdatePartDto) {
    // Kiem tra part ton tai
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    // Validate courseId neu co
    if (updatePartDto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updatePartDto.courseId },
      });
      if (!course) {
        throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }
    }

    // Validate questionBankId neu co
    if (updatePartDto.questionBankId) {
      const questionBank = await this.prisma.questionBank.findUnique({
        where: { id: updatePartDto.questionBankId },
      });
      if (!questionBank) {
        throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
      }
      const courseId = updatePartDto.courseId || part.courseId;
      if (questionBank.courseId !== courseId) {
        throw new BadRequestException(ERROR_MESSAGES.QUESTION_BANK_NOT_BELONG_COURSE);
      }
    }

    // Validate openTime < closeTime
    const openTime = updatePartDto.openTime || part.openTime;
    const closeTime = updatePartDto.closeTime || part.closeTime;
    if (openTime && closeTime) {
      if (new Date(openTime) >= new Date(closeTime)) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_TIME_RANGE);
      }
    }

    return this.prisma.part.update({
      where: { id },
      data: updatePartDto,
      include: {
        course: { select: { id: true, code: true, name: true } },
        questionBank: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    // Kiem tra part ton tai
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    return this.prisma.part.delete({
      where: { id },
    });
  }
}
