// backend/src/exam-results/exam-results.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { GradeEssayDto } from './dto/grade-essay.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('exam-results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) { }

  @Get()
  @Roles(Role.ADMIN)
  getAllResults(
    @Query('examId') examId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.examResultsService.getAllResults({ examId, userId });
  }

  @Get('essay-to-grade')
  @Roles(Role.ADMIN)
  getEssayQuestionsToGrade(@Query('examId') examId?: string) {
    return this.examResultsService.getEssayQuestionsToGrade(examId);
  }

  @Get('statistics/:examId')
  @Roles(Role.ADMIN)
  getExamStatistics(@Param('examId') examId: string) {
    return this.examResultsService.getExamStatistics(examId);
  }

  @Get(':resultId')
  getResultDetail(@Request() req, @Param('resultId') resultId: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.examResultsService.getResultDetail(
      resultId,
      req.user.userId,
      isAdmin,
    );
  }

  @Post('grade-essay')
  @Roles(Role.ADMIN)
  gradeEssayQuestion(@Body() gradeEssayDto: GradeEssayDto) {
    return this.examResultsService.gradeEssayQuestion(gradeEssayDto);
  }
}
