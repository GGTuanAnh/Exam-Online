// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite default port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Exam Online System API')
    .setDescription('API documentation cho he thong thi online')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('courses', 'Course management')
    .addTag('question-banks', 'Question bank management')
    .addTag('questions', 'Question management')
    .addTag('exams', 'Exam management')
    .addTag('exam-sessions', 'Exam session management')
    .addTag('exam-results', 'Exam result management')
    .addTag('notifications', 'Notification management')
    .addTag('users', 'User management')
    .addTag('parts', 'Part management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhap JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger documentation: http://localhost:3000/api-docs');
}
bootstrap();
