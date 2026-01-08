// backend/src/exam-results/exam-results.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GradeEssayDto } from './dto/grade-essay.dto';
import { ResultStatus } from '@prisma/client';

@Injectable()
export class ExamResultsService {
  constructor(private prisma: PrismaService) {}

  // Admin: Lay tat ca ket qua thi (co filter)
  async getAllResults(query?: { examId?: string; userId?: string; status?: ResultStatus }) {
    const where: any = {};

    if (query?.examId) {
      where.examId = query.examId;
    }
    if (query?.userId) {
      where.userId = query.userId;
    }
    if (query?.status) {
      where.status = query.status;
    }

    return this.prisma.examResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            exam: {
              select: {
                id: true,
                title: true,
                course: {
                  select: { id: true, name: true, code: true },
                },
              },
            },
          },
        },
        _count: {
          select: { details: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Lay chi tiet ket qua (User xem cua minh, Admin xem tat ca)
  async getResultDetail(resultId: string, userId?: string, isAdmin = false) {
    const result = await this.prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                duration: true,
                course: true,
              },
            },
          },
        },
        details: {
          include: {
            question: {
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

    if (!result) {
      throw new NotFoundException(`Ket qua voi ID ${resultId} khong ton tai`);
    }

    // User chi xem duoc ket qua cua minh
    if (!isAdmin && userId && result.userId !== userId) {
      throw new ForbiddenException('Ban khong co quyen xem ket qua nay');
    }

    return result;
  }

  // Admin: Cham diem cau tu luan
  async gradeEssayQuestion(gradeEssayDto: GradeEssayDto) {
    const { resultDetailId, pointEarned, feedback } = gradeEssayDto;

    // 1. Validate ResultDetail ton tai
    const detail = await this.prisma.examResultDetail.findUnique({
      where: { id: resultDetailId },
      include: {
        result: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!detail) {
      throw new NotFoundException(`Chi tiet ket qua voi ID ${resultDetailId} khong ton tai`);
    }

    // 2. Lay thong tin ExamQuestion de biet diem toi da
    const examQuestion = await this.prisma.examQuestion.findUnique({
      where: {
        examId_questionId: {
          examId: detail.result.session.examId,
          questionId: detail.questionId,
        },
      },
    });

    if (!examQuestion) {
      throw new NotFoundException('Khong tim thay thong tin cau hoi trong de thi');
    }

    // 3. Validate diem khong vuot qua diem toi da
    if (pointEarned > examQuestion.point) {
      throw new BadRequestException(
        `Diem cham (${pointEarned}) khong duoc vuot qua diem toi da cua cau (${examQuestion.point})`
      );
    }

    // 4. Cap nhat diem va feedback
    const updatedDetail = await this.prisma.examResultDetail.update({
      where: { id: resultDetailId },
      data: {
        pointEarned,
        isCorrect: pointEarned > 0,
      },
    });

    // 5. Tinh lai tong diem cua result
    await this.recalculateScore(detail.resultId);

    return {
      ...updatedDetail,
      feedback,
      message: 'Da cham diem cau tu luan',
    };
  }

  // Helper: Tinh lai tong diem sau khi cham tu luan
  private async recalculateScore(resultId: string) {
    // 1. Lay tat ca details
    const details = await this.prisma.examResultDetail.findMany({
      where: { resultId },
    });

    // 2. Tinh tong diem va so cau dung
    let totalScore = 0;
    let correctAnswers = 0;

    for (const detail of details) {
      totalScore += detail.pointEarned;
      if (detail.isCorrect) correctAnswers++;
    }

    // 3. Lay thong tin exam de tinh passingScore
    const result = await this.prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        session: {
          include: {
            exam: {
              include: { questions: true },
            },
          },
        },
      },
    });

    if (!result) return;

    const maxScore = result.session.exam.questions.reduce((sum, eq) => sum + eq.point, 0);
    const passingScore = maxScore * 0.5;
    const status = totalScore >= passingScore ? ResultStatus.PASSED : ResultStatus.FAILED;

    // 4. Cap nhat ExamResult
    await this.prisma.examResult.update({
      where: { id: resultId },
      data: {
        score: totalScore,
        correctAnswers,
        status,
      },
    });

    return { totalScore, correctAnswers, status };
  }

  // Thong ke ket qua theo exam
  async getExamStatistics(examId: string) {
    const results = await this.prisma.examResult.findMany({
      where: { examId },
    });

    if (results.length === 0) {
      return {
        examId,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const totalAttempts = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / totalAttempts;
    const passedCount = results.filter(r => r.status === ResultStatus.PASSED).length;
    const passRate = (passedCount / totalAttempts) * 100;
    const scores = results.map(r => r.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return {
      examId,
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      highestScore,
      lowestScore,
      passedCount,
      failedCount: totalAttempts - passedCount,
    };
  }

  // Lay danh sach bai tu luan can cham
  async getEssayQuestionsToGrade(examId?: string) {
    const where: any = {
      question: {
        type: 'ESSAY',
      },
      pointEarned: 0, // Chua duoc cham diem
    };

    if (examId) {
      where.result = {
        examId,
      };
    }

    return this.prisma.examResultDetail.findMany({
      where,
      include: {
        question: {
          select: {
            id: true,
            content: true,
            type: true,
          },
        },
        result: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            session: {
              select: {
                exam: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        result: {
          submittedAt: 'asc',
        },
      },
    });
  }
}
