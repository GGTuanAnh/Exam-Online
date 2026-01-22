import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExamShiftsService } from './exam-shifts.service';
import { CreateExamShiftDto } from './dto/create-exam-shift.dto';
import { UpdateExamShiftDto } from './dto/update-exam-shift.dto';

@Controller('exam-shifts')
export class ExamShiftsController {
  constructor(private readonly examShiftsService: ExamShiftsService) { }

  @Post()
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
  update(@Param('id') id: string, @Body() updateExamShiftDto: UpdateExamShiftDto) {
    return this.examShiftsService.update(id, updateExamShiftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examShiftsService.remove(id);
  }
}
