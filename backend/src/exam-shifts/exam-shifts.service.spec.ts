import { Test, TestingModule } from '@nestjs/testing';
import { ExamShiftsService } from './exam-shifts.service';

describe('ExamShiftsService', () => {
  let service: ExamShiftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamShiftsService],
    }).compile();

    service = module.get<ExamShiftsService>(ExamShiftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
