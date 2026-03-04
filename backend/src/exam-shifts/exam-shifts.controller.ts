import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ExamShiftsService } from './exam-shifts.service';
import { CreateExamShiftDto } from './dto/create-exam-shift.dto';
import { UpdateExamShiftDto } from './dto/update-exam-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('exam-shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamShiftsController {
  constructor(private readonly examShiftsService: ExamShiftsService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createExamShiftDto: CreateExamShiftDto) {
    return this.examShiftsService.create(createExamShiftDto);
  }

  @Get()
  findAll(@Query('examId') examId?: string) {
    return this.examShiftsService.findAll(examId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examShiftsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateExamShiftDto: UpdateExamShiftDto) {
    return this.examShiftsService.update(id, updateExamShiftDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.examShiftsService.remove(id);
  }
}
