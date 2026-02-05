// backend/src/exam-sessions/exam-sessions.controller.ts
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
import { ExamSessionsService } from './exam-sessions.service';
import { StartExamDto } from './dto/start-exam.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ExamStatus } from '@prisma/client';

@Controller('exam-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamSessionsController {
  constructor(private readonly examSessionsService: ExamSessionsService) { }

  @Get()
  @Roles(Role.ADMIN)
  getAllSessions(
    @Query('examId') examId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: ExamStatus,
    @Query('examShiftId') examShiftId?: string,
  ) {
    return this.examSessionsService.getAllSessions({ examId, userId, status, examShiftId });
  }

  @Post('start')
  startExam(@Request() req, @Body() startExamDto: StartExamDto) {
    return this.examSessionsService.startExam(req.user.userId, startExamDto);
  }

  @Post('save-answer')
  saveAnswer(@Request() req, @Body() saveAnswerDto: SaveAnswerDto) {
    return this.examSessionsService.saveAnswer(req.user.userId, saveAnswerDto);
  }

  @Post('submit')
  submitExam(@Request() req, @Body() submitExamDto: SubmitExamDto) {
    return this.examSessionsService.submitExam(req.user.userId, submitExamDto);
  }

  @Get('my-sessions')
  getMyExamSessions(@Request() req, @Query('examId') examId?: string) {
    return this.examSessionsService.getMyExamSessions(req.user.userId, examId);
  }

  @Get(':sessionId')
  getSessionDetail(@Request() req, @Param('sessionId') sessionId: string) {
    return this.examSessionsService.getSessionDetail(req.user.userId, sessionId);
  }

  @Get(':sessionId/resume')
  resumeSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.examSessionsService.resumeSession(req.user.userId, sessionId);
  }

  // Endpoint để sync timer với server (tránh desync khi pause/resume tab)
  @Get(':sessionId/time')
  getSessionTime(@Request() req, @Param('sessionId') sessionId: string) {
    return this.examSessionsService.getSessionTime(req.user.userId, sessionId);
  }
}
