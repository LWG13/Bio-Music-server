import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import * as bodyParser from "body-parser"
import * as express from "express"
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
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(new SanitizeMiddleware().use);
  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
  app.enableCors({
  origin: "https://8adef7fa-9807-44e6-991b-a136b916412e-00-3f29t5m359pgk.spock.replit.dev",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
  app.use(cookieParser());
  
  await app.listen(3000);
  console.log(`Application is running on: http://0.0.0.0:3000`);
}
bootstrap();
