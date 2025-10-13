import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common'
import { SanitizeMiddleware } from './sanitizeMiddleware';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: false, 
      transform: true, 
    }),
  );
  app.use(new SanitizeMiddleware().use);
  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
  app.use(cookieParser());
  app.enableCors({
   origin: "https://8adef7fa-9807-44e6-991b-a136b916412e-00-3f29t5m359pgk.spock.replit.dev",
   methods: ["GET", "POST", "PUT", "DELETE"],
   credentials: true
  })
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
