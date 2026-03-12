import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { OrderService } from './order.service';
import { R2Module } from './r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [AppController],
  providers: [AppService, DatabaseService, AuthService, CartService, OrderService, CacheService],
})
export class AppModule {}
