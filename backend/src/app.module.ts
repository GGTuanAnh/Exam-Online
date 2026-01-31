// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { QuestionBanksModule } from './question-banks/question-banks.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { ExamSessionsModule } from './exam-sessions/exam-sessions.module';
import { ExamResultsModule } from './exam-results/exam-results.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PartsModule } from './parts/parts.module';
import { UsersModule } from './users/users.module';
import { ExamShiftsModule } from './exam-shifts/exam-shifts.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ session: false }),

    // Rate Limiting: 100 requests per 60 seconds (increased for development)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests (10x higher for development/testing)
    }]),

    // Cấu hình Mailer
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"Exam Online System" <${process.env.MAIL_USER}>`,
      },
    }),

    AuthModule,
    CoursesModule,
    QuestionBanksModule,
    QuestionsModule,
    ExamsModule,
    ExamSessionsModule,
    ExamResultsModule,
    NotificationsModule,
    PartsModule,
    UsersModule,
    ExamShiftsModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    // Enable rate limiting globally for security
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
