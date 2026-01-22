import { Test, TestingModule } from '@nestjs/testing';
import { ExamShiftsController } from './exam-shifts.controller';
import { ExamShiftsService } from './exam-shifts.service';

describe('ExamShiftsController', () => {
  let controller: ExamShiftsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamShiftsController],
      providers: [ExamShiftsService],
    }).compile();

    controller = module.get<ExamShiftsController>(ExamShiftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
