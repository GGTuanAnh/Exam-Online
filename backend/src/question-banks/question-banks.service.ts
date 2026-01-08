// backend/src/question-banks/question-banks.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ERROR_MESSAGES } from '../common/constants/messages.constants';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionBankDto: CreateQuestionBankDto) {
    // Kiem tra course co ton tai khong
    const course = await this.prisma.course.findUnique({
      where: { id: createQuestionBankDto.courseId },
    });

    if (!course) {
      throw new BadRequestException(ERROR_MESSAGES.COURSE_NOT_FOUND);
    }

    const questionBank = await this.prisma.questionBank.create({
      data: {
        name: createQuestionBankDto.name,
        description: createQuestionBankDto.description,
        courseId: createQuestionBankDto.courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return questionBank;
  }

  async findAll(courseId?: string) {
    const where = courseId ? { courseId } : {};

    const questionBanks = await this.prisma.questionBank.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return questionBanks.map((qb) => ({
      ...qb,
      totalQuestions: qb._count.questions,
      _count: undefined,
    }));
  }

  async findOne(id: string) {
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        questions: {
          select: {
            id: true,
            content: true,
            type: true,
            level: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!questionBank) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
    }

    return {
      ...questionBank,
      totalQuestions: questionBank.questions.length,
    };
  }

  async update(id: string, updateQuestionBankDto: UpdateQuestionBankDto) {
    // Kiem tra question bank co ton tai khong
    const existingQB = await this.prisma.questionBank.findUnique({
      where: { id },
    });

    if (!existingQB) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
    }

    // Neu update courseId, kiem tra course co ton tai khong
    if (updateQuestionBankDto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateQuestionBankDto.courseId },
      });

      if (!course) {
        throw new BadRequestException(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }
    }

    const updatedQB = await this.prisma.questionBank.update({
      where: { id },
      data: updateQuestionBankDto,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updatedQB;
  }

  async remove(id: string) {
    // Kiem tra question bank co ton tai khong
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!questionBank) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
    }

    // Canh bao neu co cau hoi ben trong
    if (questionBank._count.questions > 0) {
      throw new BadRequestException(
        `Không thể xóa ngân hàng câu hỏi có ${questionBank._count.questions} câu hỏi. Vui lòng xóa câu hỏi trước.`,
      );
    }

    await this.prisma.questionBank.delete({
      where: { id },
    });

    return {
      message: 'Xóa ngân hàng câu hỏi thành công',
    };
  }
}
