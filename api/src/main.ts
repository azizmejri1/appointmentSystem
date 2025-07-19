import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // allow your React frontend
    credentials: true,              // if you use cookies/auth
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
