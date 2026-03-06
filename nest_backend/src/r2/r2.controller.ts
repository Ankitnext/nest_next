import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from './r2.service';
import * as jwt from 'jsonwebtoken';

@Controller('api/upload')
export class R2Controller {
  constructor(private readonly r2Service: R2Service) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Headers('authorization') auth: string,
    @UploadedFile() file: any,
  ) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = auth.slice(7);
    const secret = process.env.JWT_SECRET || 'change_me_in_env';
    try {
      jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.r2Service.uploadImage(file);
    return {
      success: true,
      url: result.url,
    };
  }
}
