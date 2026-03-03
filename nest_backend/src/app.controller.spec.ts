import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { OrderService } from './order.service';

describe('AppController', () => {
  let appController: AppController;

  const mockService = {};

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockService },
        { provide: DatabaseService, useValue: mockService },
        { provide: AuthService, useValue: mockService },
        { provide: CartService, useValue: mockService },
        { provide: OrderService, useValue: mockService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('configuration', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
