import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://10.244.179.37:3000', 'http://192.168.29.26:3000', 'http://10.81.69.91:3000', 'https://baazaarse.com', 'https://www.baazaarse.com'],
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
