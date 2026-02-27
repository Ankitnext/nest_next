import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from './database.service';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async register(name: string, email: string, password: string): Promise<{ token: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.databaseService.query<UserRecord>(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [normalizedEmail],
    );

    if (existing.length > 0) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.databaseService.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash`,
      [name.trim(), normalizedEmail, passwordHash],
    );

    return { token: this.signToken(created[0]) };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.databaseService.query<UserRecord>(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [normalizedEmail],
    );

    if (users.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, users[0].password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { token: this.signToken(users[0]) };
  }

  private signToken(user: UserRecord): string {
    const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
    return jwt.sign({ sub: user.id, name: user.name, email: user.email }, secret, {
      expiresIn: '7d',
    });
  }

  private assertDatabaseConfigured(): void {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException(
        'DATABASE_URL is not configured. Add Neon connection string in .env',
      );
    }
  }
}
