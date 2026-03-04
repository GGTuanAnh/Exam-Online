// backend/src/questions/questions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ERROR_MESSAGES } from '../common/constants/messages.constants';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType, QuestionLevel } from '@prisma/client';
import * as XLSX from 'xlsx';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) { }

  async importQuestions(questionBankId: string, fileBuffer: Buffer) {
    // Check if bank exists
    const bank = await this.prisma.questionBank.findUnique({ where: { id: questionBankId } });
    if (!bank) throw new NotFoundException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const results = {
      total: jsonData.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const [index, row] of jsonData.entries()) {
      try {
        // Expected format: Content, Type, Level, Option1, Correct1, Option2, Correct2...
        const content = row['Content'];
        const typeStr = row['Type']?.toString().toUpperCase();
        const levelStr = row['Level']?.toString().toUpperCase();

        if (!content || !typeStr || !levelStr) {
          throw new Error('Thiếu trường bắt buộc (Content, Type, Level)');
        }

        const type = this.parseQuestionType(typeStr);
        const level = this.parseQuestionLevel(levelStr);

        const options = [];
        // Support up to 10 options
        for (let i = 1; i <= 10; i++) {
          const optContent = row[`Option${i}`];
          const optCorrect = row[`Correct${i}`];

          if (optContent !== undefined && optContent !== null && optContent !== '') {
            options.push({
              content: String(optContent),
              isCorrect: optCorrect === true || optCorrect === 1 || String(optCorrect).toLowerCase() === 'true',
            });
          }
        }

        this.validateOptions(type, options);

        await this.prisma.question.create({
          data: {
            content,
            type,
            level,
            questionBankId,
            options: options.length > 0 ? { create: options } : undefined
          }
        });

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Dòng ${index + 2}: ${err.message}`);
      }
    }

    // Update totalQuestions counter in QuestionBank
    if (results.success > 0) {
      await this.prisma.questionBank.update({
        where: { id: questionBankId },
        data: {
          totalQuestions: {
            increment: results.success,
          },
        },
      });
    }

    return results;
  }

  private parseQuestionType(val: string): QuestionType {
    const clean = val.trim().replace(/\s+/g, '_');
    if (Object.values(QuestionType).includes(clean as QuestionType)) {
      return clean as QuestionType;
    }
    // Mappings for user friendliness
    if (clean === 'TRAC_NGHIEM' || clean === 'MULTIPLE') return QuestionType.MULTIPLE_CHOICE;
    if (clean === 'MOT_DAP_AN' || clean === 'SINGLE') return QuestionType.SINGLE_CHOICE;
    if (clean === 'DUNG_SAI' || clean === 'TRUE_FALSE') return QuestionType.TRUE_FALSE;
    if (clean === 'TU_LUAN' || clean === 'ESSAY') return QuestionType.ESSAY;

    throw new Error(`Loại câu hỏi không hợp lệ: ${val}`);
  }

  private parseQuestionLevel(val: string): QuestionLevel {
    const clean = val.trim();
    if (Object.values(QuestionLevel).includes(clean as QuestionLevel)) {
      return clean as QuestionLevel;
    }
    if (clean === 'DE' || clean === 'EASY') return QuestionLevel.EASY;
    if (clean === 'TRUNG_BINH' || clean === 'MEDIUM') return QuestionLevel.MEDIUM;
    if (clean === 'KHO' || clean === 'HARD') return QuestionLevel.HARD;

    throw new Error(`Mức độ không hợp lệ: ${val}`);
  }

  async create(createQuestionDto: CreateQuestionDto) {
    // Kiem tra questionBank co ton tai khong
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id: createQuestionDto.questionBankId },
    });

    if (!questionBank) {
      throw new BadRequestException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
    }

    // Validate options theo loai cau hoi
    this.validateOptions(createQuestionDto.type, createQuestionDto.options);

    // Tao question voi options
    const question = await this.prisma.question.create({
      data: {
        content: createQuestionDto.content,
        type: createQuestionDto.type,
        level: createQuestionDto.level,
        questionBankId: createQuestionDto.questionBankId,
        options: createQuestionDto.options
          ? {
            create: createQuestionDto.options.map((opt) => ({
              content: opt.content,
              isCorrect: opt.isCorrect,
            })),
          }
          : undefined,
      },
      include: {
        options: true,
        questionBank: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Cap nhat totalQuestions trong QuestionBank
    await this.prisma.questionBank.update({
      where: { id: createQuestionDto.questionBankId },
      data: {
        totalQuestions: {
          increment: 1,
        },
      },
    });

    return question;
  }

  async findAll(questionBankId?: string, type?: QuestionType, level?: string) {
    const where: any = {};

    if (questionBankId) {
      where.questionBankId = questionBankId;
    }

    if (type) {
      where.type = type;
    }

    if (level) {
      where.level = level;
    }

    const questions = await this.prisma.question.findMany({
      where,
      include: {
        options: true,
        questionBank: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return questions;
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        questionBank: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    // Kiem tra question co ton tai khong
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existingQuestion) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    // Neu update questionBankId, kiem tra co ton tai khong
    if (updateQuestionDto.questionBankId) {
      const questionBank = await this.prisma.questionBank.findUnique({
        where: { id: updateQuestionDto.questionBankId },
      });

      if (!questionBank) {
        throw new BadRequestException(ERROR_MESSAGES.QUESTION_BANK_NOT_FOUND);
      }
    }

    // Validate options neu co update type hoac options
    const newType = updateQuestionDto.type || existingQuestion.type;
    if (updateQuestionDto.options) {
      this.validateOptions(newType, updateQuestionDto.options);
    }

    // Update question
    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: {
        content: updateQuestionDto.content,
        type: updateQuestionDto.type,
        level: updateQuestionDto.level,
        questionBankId: updateQuestionDto.questionBankId,
        // Neu co update options, xoa cu va tao moi
        options: updateQuestionDto.options
          ? {
            deleteMany: {},
            create: updateQuestionDto.options.map((opt) => ({
              content: opt.content,
              isCorrect: opt.isCorrect,
            })),
          }
          : undefined,
      },
      include: {
        options: true,
        questionBank: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedQuestion;
  }

  async remove(id: string) {
    // Kiem tra question co ton tai khong
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        questionBank: true,
      },
    });

    if (!question) {
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    // Xoa question (options se tu dong xoa do onDelete: Cascade)
    await this.prisma.question.delete({
      where: { id },
    });

    // Cap nhat totalQuestions trong QuestionBank
    await this.prisma.questionBank.update({
      where: { id: question.questionBankId },
      data: {
        totalQuestions: {
          decrement: 1,
        },
      },
    });

    return {
      message: 'Xóa câu hỏi thành công',
    };
  }

  // Helper function: Validate options theo loai cau hoi
  private validateOptions(type: QuestionType, options?: any[]) {
    if (type === QuestionType.ESSAY) {
      // ESSAY khong can options
      return;
    }

    if (!options || options.length < 2) {
      throw new BadRequestException(
        `Câu hỏi loại ${type} phải có ít nhất 2 đáp án`,
      );
    }

    if (type === QuestionType.TRUE_FALSE && options.length !== 2) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_TRUE_FALSE_ANSWERS);
    }

    // Kiem tra phai co it nhat 1 dap an dung
    const correctCount = options.filter((opt) => opt.isCorrect).length;

    if (correctCount === 0) {
      throw new BadRequestException(ERROR_MESSAGES.NO_CORRECT_ANSWER);
    }

    if (type === QuestionType.SINGLE_CHOICE && correctCount > 1) {
      throw new BadRequestException(
        'Câu hỏi 1 đáp án đúng chỉ được có 1 đáp án đúng',
      );
    }

    if (type === QuestionType.TRUE_FALSE && correctCount !== 1) {
      throw new BadRequestException(
        'Câu hỏi Đúng/Sai phải có đúng 1 đáp án đúng',
      );
    }
  }
}
