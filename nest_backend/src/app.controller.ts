import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import type { Product } from './app.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get('products')
  getProducts(): Product[] {
    return this.appService.getProducts();
  }

  @Get('categories')
  getCategories(): string[] {
    return this.appService.getCategories();
  }

  @Get('products/:id')
  getProductById(@Param('id', ParseIntPipe) id: number): Product {
    const product = this.appService.getProductById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  @Get('stores/:username/products')
  getProductsByStore(@Param('username') username: string): Product[] {
    return this.appService.getProductsByStore(username);
  }

  @Post('auth/register')
  async register(
    @Body() body: { name?: string; email?: string; password?: string },
  ): Promise<{ token: string }> {
    const name = body.name?.trim();
    const email = body.email?.trim();
    const password = body.password?.trim();

    if (!name || !email || !password) {
      throw new BadRequestException('name, email and password are required');
    }

    return this.authService.register(name, email, password);
  }

  @Post('auth/login')
  async login(
    @Body() body: { email?: string; password?: string },
  ): Promise<{ token: string }> {
    const email = body.email?.trim();
    const password = body.password?.trim();

    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }

    return this.authService.login(email, password);
  }
}
