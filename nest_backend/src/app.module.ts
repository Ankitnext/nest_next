import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { DatabaseService } from './database.service';
import { OrderService } from './order.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DatabaseService, AuthService, CartService, OrderService],
})
export class AppModule {}
