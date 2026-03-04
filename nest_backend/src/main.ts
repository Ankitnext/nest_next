import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://10.244.179.37:3000'],
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
