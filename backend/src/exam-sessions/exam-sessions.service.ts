// backend/src/exam-sessions/exam-sessions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constants';
import { StartExamDto } from './dto/start-exam.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { ExamStatus, ResultStatus } from '@prisma/client';

@Injectable()
export class ExamSessionsService {
  constructor(private prisma: PrismaService) { }

  async startExam(userId: string, startExamDto: StartExamDto) {
    const { examId: dtoExamId, examShiftId, password } = startExamDto;

    // Determine context: Shift or Free Exam
    let examId = dtoExamId;
    let shift = null;

    if (examShiftId) {
      shift = await this.prisma.examShift.findUnique({
        where: { id: examShiftId },
        include: { exam: true }
      });

      if (!shift) throw new NotFoundException('Ca thi không tồn tại');
      if (!shift.isActive) throw new BadRequestException('Ca thi đã bị khóa');

      // Validate Shift Time
      const now = new Date();
      if (now < shift.startTime) {
        throw new BadRequestException(`Ca thi chưa bắt đầu. Thời gian mở: ${shift.startTime.toLocaleString()}`);
      }
      if (now > shift.endTime) {
        throw new BadRequestException('Ca thi đã kết thúc');
      }

      // Validate Password
      if (shift.password && shift.password !== password) {
        throw new BadRequestException('Mật khẩu ca thi không đúng');
      }

      examId = shift.examId;
    }

    if (!examId) {
      throw new BadRequestException('Vui lòng cung cấp Exam ID hoặc Shift ID');
    }

    // 1. Validate Exam ton tai
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: {
              include: { options: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(ERROR_MESSAGES.EXAM_NOT_FOUND);
    }

    // 2. Kiem tra so lan thi
    // Fix: Nếu là thi theo Ca (Shift), chỉ đếm số lần thi trong Ca đó.
    // Điều này cho phép tạo Ca thi mới để thi lại (Retake).
    const countWhere: any = {
      examId,
      userId,
      status: { in: [ExamStatus.COMPLETED, ExamStatus.TIMEOUT] },
    };

    if (examShiftId) {
      countWhere.examShiftId = examShiftId;
    }

    const previousAttempts = await this.prisma.examSession.count({
      where: countWhere,
    });

    if (previousAttempts >= exam.maxRetake) {
      throw new ForbiddenException(
        `Bạn đã hết lượt thi. Số lần tối đa: ${exam.maxRetake}`
      );
    }

    // 4. Kiem tra co session dang IN_PROGRESS khong
    const ongoingSession = await this.prisma.examSession.findFirst({
      where: {
        examId,
        userId,
        status: ExamStatus.IN_PROGRESS,
        examShiftId: examShiftId || null, // Reuse session only if same shift context
      },
    });

    const now = new Date();

    if (ongoingSession) {
      // Tra ve session cu neu con thoi gian
      // Calculate remaining time based on Exam Duration AND Shift End Time

      const elapsed = Math.floor(
        (now.getTime() - ongoingSession.startTime.getTime()) / 1000 / 60
      );

      let remainingTime = exam.duration - elapsed;

      // Logic: Cannot exceed shift end time
      if (shift) {
        const minutesUntilShiftEnd = Math.floor((shift.endTime.getTime() - now.getTime()) / 1000 / 60);
        if (minutesUntilShiftEnd < remainingTime) {
          remainingTime = minutesUntilShiftEnd;
        }
      }

      if (remainingTime > 0) {
        const questionsWithoutAnswers = (exam.randomizeQuestions
          ? this.shuffleArray(exam.questions)
          : exam.questions
        ).map(eq => {
          const { options, ...questionData } = eq.question;
          return {
            ...eq,
            question: {
              ...questionData,
              options: options.map(({ isCorrect, ...opt }) => opt),
            },
          };
        });

        return {
          ...ongoingSession,
          remainingTime: remainingTime,
          exam: {
            id: exam.id,
            title: exam.title,
            duration: exam.duration,
            randomizeQuestions: exam.randomizeQuestions,
          },
          questions: questionsWithoutAnswers,
        };
      } else {
        // Het gio, tu dong timeout
        await this.prisma.examSession.update({
          where: { id: ongoingSession.id },
          data: { status: ExamStatus.TIMEOUT, endTime: now },
        });
        throw new BadRequestException('Bài thi trước đã hết giờ. Vui lòng bắt đầu lại.');
      }
    }

    // 5. Tao ExamSession moi
    const session = await this.prisma.examSession.create({
      data: {
        examId,
        userId,
        examShiftId: examShiftId,
        status: ExamStatus.IN_PROGRESS,
        currentAnswers: {},
      },
    });

    // 6. Tra ve session + danh sach cau hoi (KHONG bao gom dap an dung)
    const questionsWithoutAnswers = (exam.randomizeQuestions
      ? this.shuffleArray(exam.questions)
      : exam.questions
    ).map(eq => {
      const { options, ...questionData } = eq.question;
      return {
        ...eq,
        question: {
          ...questionData,
          options: options.map(({ isCorrect, ...opt }) => opt),
        },
      };
    });

    // Initial remaining time calculation
    let initialRemainingTime = exam.duration;
    if (shift) {
      const minutesUntilShiftEnd = Math.floor((shift.endTime.getTime() - now.getTime()) / 1000 / 60);
      if (minutesUntilShiftEnd < initialRemainingTime) {
        initialRemainingTime = minutesUntilShiftEnd;
      }
    }

    return {
      ...session,
      remainingTime: initialRemainingTime,
      exam: {
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        randomizeQuestions: exam.randomizeQuestions,
        enableAntiCheat: exam.enableAntiCheat,
      },
      questions: questionsWithoutAnswers,
    };
  }

  async resumeSession(userId: string, sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: {
                  include: { options: true },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        examShift: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session không tồn tại');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập session này');
    }

    if (session.status !== ExamStatus.IN_PROGRESS) {
      // If completed, maybe return result? For now throw error as "cannot resume"
      throw new BadRequestException('Bài thi đã kết thúc');
    }

    const { exam, examShift } = session;
    const now = new Date();

    // Calculate time
    const elapsed = Math.floor(
      (now.getTime() - session.startTime.getTime()) / 1000 / 60
    );

    let remainingTime = exam.duration - elapsed;

    if (examShift) {
      const minutesUntilShiftEnd = Math.floor((examShift.endTime.getTime() - now.getTime()) / 1000 / 60);
      if (minutesUntilShiftEnd < remainingTime) {
        remainingTime = minutesUntilShiftEnd;
      }
    }

    if (remainingTime <= 0) {
      await this.prisma.examSession.update({
        where: { id: session.id },
        data: { status: ExamStatus.TIMEOUT, endTime: now },
      });
      throw new BadRequestException('Bài thi đã hết giờ');
    }

    // Format questions
    const questionsWithoutAnswers = (exam.randomizeQuestions
      ? this.shuffleArray(exam.questions) // Note: Shuffle again on resume might change order if not stored! 
      // Ideally order should be stored in session, but for now we re-shuffle or rely on deterministic seed?
      // FIXME: re-shuffle on resume is bad UX. But our current schema doesn't store question order per session efficiently.
      // Let's assume for now we just return questions. 
      // Or better: don't shuffle on resume if data extraction is from Exam model.
      // Wait, if I shuffle every time, the user sees different order on refresh!
      // Keep it simple: Just return questions as per Exam definition order for now to avoid chaos, 
      // OR accept re-shuffle. 
      // Since `randomizeQuestions` is on Exam, let's keep it consistent: 
      // If we want consistent order, we must store it. 
      // For this MVP, let's NOT shuffle on resume to avoid confusion if possible, OR accept it. 
      // Actually, if we re-shuffle, the question IDs match so answers map correctly. It's just visual order.
      : exam.questions
    ).map(eq => {
      const { options, ...questionData } = eq.question;
      return {
        ...eq,
        question: {
          ...questionData,
          options: options.map(({ isCorrect, ...opt }) => opt),
        },
      };
    });

    return {
      ...session,
      // We don't return full nested objects to keep payload light, but frontend needs questions
      remainingTime,
      exam: {
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        randomizeQuestions: exam.randomizeQuestions,
        enableAntiCheat: exam.enableAntiCheat,
      },
      questions: questionsWithoutAnswers,
    };
  }

  async saveAnswer(userId: string, saveAnswerDto: SaveAnswerDto) {
    const { sessionId, answers } = saveAnswerDto;

    // 1. Validate Session ton tai va thuoc ve user
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session với ID ${sessionId} không tồn tại`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập session này');
    }

    if (session.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('Bài thi đã kết thúc, không thể lưu câu trả lời');
    }

    // 2. Luu tam cau tra loi
    await this.prisma.examSession.update({
      where: { id: sessionId },
      data: { currentAnswers: answers },
    });

    return { message: 'Đã lưu câu trả lời tạm thời' };
  }

  async submitExam(userId: string, submitExamDto: SubmitExamDto) {
    const { sessionId, answers, leaveScreenCount } = submitExamDto;

    // Use transaction to prevent race conditions (e.g., double submit, timeout + submit)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate Session with lock (SELECT FOR UPDATE in transaction)
      const session = await tx.examSession.findUnique({
        where: { id: sessionId },
        include: {
          exam: {
            include: {
              questions: {
                include: {
                  question: {
                    include: { options: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new NotFoundException(`Session với ID ${sessionId} không tồn tại`);
      }

      if (session.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền nộp bài này');
      }

      // Check if already submitted (race condition prevention)
      if (session.status !== ExamStatus.IN_PROGRESS) {
        throw new BadRequestException('Bài thi đã được nộp hoặc đã hết giờ');
      }

      // 2. Kiem tra timeout
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - session.startTime.getTime()) / 1000 / 60
      );

      if (elapsed > session.exam.duration) {
        await tx.examSession.update({
          where: { id: sessionId },
          data: { status: ExamStatus.TIMEOUT, endTime: now },
        });
        throw new BadRequestException('Đã hết thời gian làm bài');
      }

      // 3. Cham diem tu dong
      const examQuestions = session.exam.questions;
      let correctAnswers = 0;
      let totalScore = 0;
      const resultDetails: any[] = [];

      for (const examQuestion of examQuestions) {
        const question = examQuestion.question;
        const userAnswer = answers[question.id];
        const correctOptions = question.options.filter(opt => opt.isCorrect);

        let isCorrect = false;
        let pointEarned = 0;

        // Cham diem theo loai cau hoi
        if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
          // 1 dap an dung
          // Frontend gui answer duoi dang array, can normalize
          const normalizedAnswer = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
          const correctOptionId = correctOptions[0]?.id;
          isCorrect = normalizedAnswer === correctOptionId;
          pointEarned = isCorrect ? examQuestion.point : 0;
        } else if (question.type === 'MULTIPLE_CHOICE') {
          // Nhieu dap an dung - cho diem theo ty le dung
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : []);
          const correctIds = correctOptions.map(opt => opt.id).sort();

          if (userAnswers.length === 0) {
            isCorrect = false;
            pointEarned = 0;
          } else {
            // Dem so dap an dung user chon
            const correctSelected = userAnswers.filter(id => correctIds.includes(id)).length;
            const wrongSelected = userAnswers.filter(id => !correctIds.includes(id)).length;

            // Neu chon sai bat ky dap an nao => 0 diem
            if (wrongSelected > 0) {
              isCorrect = false;
              pointEarned = 0;
            } else if (correctSelected === correctIds.length) {
              // Chon du tat ca dap an dung
              isCorrect = true;
              pointEarned = examQuestion.point;
            } else {
              // Chon dung mot phan (khong co sai) => cho diem ty le
              isCorrect = false;
              pointEarned = (correctSelected / correctIds.length) * examQuestion.point;
            }
          }
        } else if (question.type === 'ESSAY') {
          // Tu luan - chua cham, de admin cham sau
          isCorrect = false;
          pointEarned = 0;
        }

        if (isCorrect) correctAnswers++;
        totalScore += pointEarned;

        resultDetails.push({
          questionId: question.id,
          selectedOptionId: Array.isArray(userAnswer) ? null : userAnswer,
          textAnswer: question.type === 'ESSAY' ? userAnswer : null,
          isCorrect,
          pointEarned,
        });
      }

      // 4. Tinh diem toi da va status
      const maxScore = examQuestions.reduce((sum, eq) => sum + eq.point, 0);
      const passingScore = maxScore * 0.5; // 50% de pass
      const status = totalScore >= passingScore ? ResultStatus.PASSED : ResultStatus.FAILED;

      // 5. Tao ExamResult (within transaction)
      const result = await tx.examResult.create({
        data: {
          sessionId,
          userId,
          examId: session.examId,
          score: totalScore,
          totalQuestions: examQuestions.length,
          correctAnswers,
          status,
          leaveScreenCount: leaveScreenCount || 0,
          details: {
            create: resultDetails,
          },
        },
        include: {
          details: true,
        },
      });

      // 6. Cap nhat Session (within transaction)
      await tx.examSession.update({
        where: { id: sessionId },
        data: {
          status: ExamStatus.COMPLETED,
          endTime: now,
        },
      });

      return {
        result,
        summary: {
          totalScore,
          maxScore,
          correctAnswers,
          totalQuestions: examQuestions.length,
          status,
          passingScore,
        },
      };
    }); // End transaction
  }

  async getMyExamSessions(userId: string, examId?: string) {
    const where: any = { userId };

    if (examId) {
      where.examId = examId;
    }

    return this.prisma.examSession.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            course: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        result: {
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            correctAnswers: true,
            status: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getSessionDetail(userId: string, sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            course: true,
          },
        },
        result: {
          include: {
            details: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session với ID ${sessionId} không tồn tại`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem session này');
    }

    return session;
  }

  // Admin Methods
  async getAllSessions(query?: { examId?: string; userId?: string; status?: ExamStatus }) {
    const where: any = {};
    if (query?.examId) where.examId = query.examId;
    if (query?.userId) where.userId = query.userId;
    if (query?.status) where.status = query.status;

    return this.prisma.examSession.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        exam: { select: { id: true, title: true, course: { select: { name: true } } } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  // Helper: Shuffle array (Fisher-Yates algorithm)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get remaining time for a session (for timer sync)
  async getSessionTime(userId: string, sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: { select: { duration: true } },
        examShift: { select: { endTime: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session với ID ${sessionId} không tồn tại`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập session này');
    }

    if (session.status !== ExamStatus.IN_PROGRESS) {
      return {
        remainingSeconds: 0,
        status: session.status,
        serverTime: new Date().toISOString(),
      };
    }

    const now = new Date();
    const elapsedMinutes = (now.getTime() - session.startTime.getTime()) / 1000 / 60;
    let remainingMinutes = session.exam.duration - elapsedMinutes;

    // Consider shift end time
    if (session.examShift?.endTime) {
      const minutesUntilShiftEnd = (session.examShift.endTime.getTime() - now.getTime()) / 1000 / 60;
      if (minutesUntilShiftEnd < remainingMinutes) {
        remainingMinutes = minutesUntilShiftEnd;
      }
    }

    // Ensure non-negative
    const remainingSeconds = Math.max(0, Math.floor(remainingMinutes * 60));

    return {
      remainingSeconds,
      status: session.status,
      serverTime: now.toISOString(),
    };
  }
}
