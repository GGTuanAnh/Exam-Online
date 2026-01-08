import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma.service';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ERROR_MESSAGES } from '../common/constants/messages.constants';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });
    if (existing) {
      throw new ConflictException('Mã môn học này đã tồn tại');
    }

    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  async findAll(paginationDto?: PaginationDto): Promise<PaginatedResponse<any>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!course) throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);
    
    // Kiểm tra code mới có bị trùng không (nếu update code)
    if (updateCourseDto.code) {
      const existing = await this.prisma.course.findUnique({
        where: { code: updateCourseDto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Mã môn học này đã tồn tại');
      }
    }
    
    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Kiểm tra có QuestionBanks hoặc Exams không
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questionBanks: true, exams: true },
        },
      },
    });

    if (course._count.questionBanks > 0 || course._count.exams > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học đã có ${course._count.questionBanks} ngân hàng câu hỏi và ${course._count.exams} đề thi`
      );
    }
    
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
