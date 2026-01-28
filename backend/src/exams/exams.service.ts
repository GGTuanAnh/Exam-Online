// backend/src/exams/exams.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ERROR_MESSAGES } from '../common/constants/messages.constants';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) { }

  async create(createExamDto: CreateExamDto) {
    const { questions, courseId, openTime, closeTime, ...examData } = createExamDto;

    // 1. Validate Course ton tai
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${courseId} không tồn tại`);
    }

    // 2. Validate thoi gian: openTime < closeTime
    if (openTime && closeTime && new Date(openTime) >= new Date(closeTime)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    // 3. Validate khong co questionId trung lap
    const questionIds = questions.map(q => q.questionId);
    const uniqueIds = new Set(questionIds);
    if (questionIds.length !== uniqueIds.size) {
      throw new BadRequestException(ERROR_MESSAGES.DUPLICATE_QUESTIONS);
    }

    // 4. Validate tat ca Questions ton tai
    const existingQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    if (existingQuestions.length !== questionIds.length) {
      const foundIds = existingQuestions.map(q => q.id);
      const missingIds = questionIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(
        `Các câu hỏi sau không tồn tại: ${missingIds.join(', ')}`
      );
    }

    // 5. Tao Exam voi ExamQuestions
    const exam = await this.prisma.exam.create({
      data: {
        ...examData,
        courseId,
        questions: {
          create: questions.map((q, index) => ({
            questionId: q.questionId,
            point: q.point || 1.0,
            order: q.order || index + 1, // Tu dong danh so thu tu neu khong co
          })),
        },
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return exam;
  }

  async findAll(query?: { courseId?: string; available?: boolean }) {
    const where: any = {};

    if (query?.courseId) {
      where.courseId = query.courseId;
    }

    // Loc de thi kha dung (dang trong thoi gian mo)
    // if (query?.available === true) {
    //   const now = new Date();
    //   where.AND = [
    //     { openTime: { lte: now } },
    //     { closeTime: { gte: now } },
    //   ];
    // }

    return this.prisma.exam.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        _count: {
          select: { questions: true, examSessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, isAdmin = false) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true, code: true } },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                level: true,
                // Chi admin moi thay options (bao gom dap an dung)
                options: isAdmin,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { examSessions: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Đề thi với ID ${id} không tồn tại`);
    }

    // Neu khong phai admin, xoa bo options de khong lo dap an
    if (!isAdmin && exam.questions) {
      exam.questions = exam.questions.map((eq: any) => ({
        ...eq,
        question: {
          ...eq.question,
          options: undefined, // An hoan toan options cho student
        },
      }));
    }

    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    const { questions, openTime, closeTime, ...examData } = updateExamDto;

    // 1. Validate Exam ton tai
    const existingExam = await this.prisma.exam.findUnique({
      where: { id },
      include: { examSessions: true },
    });

    if (!existingExam) {
      throw new NotFoundException(`Đề thi với ID ${id} không tồn tại`);
    }

    // 2. Khong cho phep sua neu da co nguoi thi
    if (existingExam.examSessions.length > 0) {
      throw new ForbiddenException(
        'Không thể sửa đề thi đã có sinh viên thi. Vui lòng tạo đề mới.'
      );
    }

    // 3. Validate thoi gian neu co
    if (openTime && closeTime && new Date(openTime) >= new Date(closeTime)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    // 4. Validate Questions neu co
    if (questions) {
      // Validate khong co questionId trung lap
      const questionIds = questions.map(q => q.questionId);
      const uniqueIds = new Set(questionIds);
      if (questionIds.length !== uniqueIds.size) {
        throw new BadRequestException(ERROR_MESSAGES.DUPLICATE_QUESTIONS);
      }

      const existingQuestions = await this.prisma.question.findMany({
        where: { id: { in: questionIds } },
      });

      if (existingQuestions.length !== questionIds.length) {
        const foundIds = existingQuestions.map(q => q.id);
        const missingIds = questionIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(
          `Các câu hỏi sau không tồn tại: ${missingIds.join(', ')}`
        );
      }
    }

    // 5. Update Exam
    const updateData: any = {
      ...examData,
    };

    // if (openTime !== undefined) {
    //   updateData.openTime = openTime ? new Date(openTime) : null;
    // }
    // if (closeTime !== undefined) {
    //   updateData.closeTime = closeTime ? new Date(closeTime) : null;
    // }

    // Neu co update questions, xoa het roi tao lai
    if (questions) {
      await this.prisma.examQuestion.deleteMany({
        where: { examId: id },
      });

      updateData.questions = {
        create: questions.map((q, index) => ({
          questionId: q.questionId,
          point: q.point || 1.0,
          order: q.order || index + 1,
        })),
      };
    }

    return this.prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, name: true, code: true } },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                level: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // 1. Validate Exam ton tai
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { examSessions: true },
    });

    if (!exam) {
      throw new NotFoundException(`Đề thi với ID ${id} không tồn tại`);
    }

    // 2. Khong cho phep xoa neu da co nguoi thi
    if (exam.examSessions.length > 0) {
      throw new ForbiddenException(
        'Không thể xóa đề thi đã có sinh viên thi. Dữ liệu cần được lưu trữ.'
      );
    }

    // 3. Xoa Exam (ExamQuestions se tu dong xoa do onDelete: Cascade)
    await this.prisma.exam.delete({
      where: { id },
    });

    return { message: 'Xóa đề thi thành công' };
  }
}
