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
  role: string;
  vendor_store: string | null;
};

type AdminRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

type DeliveryBoyRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  vehicle_type: string;
  is_available: boolean;
};

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async register(
    name: string,
    email: string,
    password: string,
    role: string = 'user',
    vendorStore?: string,
    phone?: string,
    vehicleType?: string,
  ): Promise<{ token: string; role: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();

    // ── Delivery boy registers into separate table ──────────────────────────
    if (role === 'delivery') {
      const existing = await this.databaseService.query<DeliveryBoyRecord>(
        'SELECT id FROM delivery_boys WHERE email = $1',
        [normalizedEmail],
      );
      if (existing.length > 0) throw new UnauthorizedException('Email already registered');

      const passwordHash = await bcrypt.hash(password, 10);
      const created = await this.databaseService.query<DeliveryBoyRecord>(
        `INSERT INTO delivery_boys (name, email, password_hash, phone, vehicle_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, password_hash, phone, vehicle_type, is_available`,
        [name.trim(), normalizedEmail, passwordHash, phone ?? null, vehicleType ?? 'Bike'],
      );
      return { token: this.signDeliveryToken(created[0]), role: 'delivery' };
    }

    // ── Regular user / vendor ───────────────────────────────────────────────
    // Silently clamp role — frontend can never create an admin via register
    const safeRole = role === 'vendor' ? 'vendor' : 'user';

    const existing = await this.databaseService.query<UserRecord>(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail],
    );
    if (existing.length > 0) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.databaseService.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash, role, vendor_store)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, password_hash, role, vendor_store`,
      [name.trim(), normalizedEmail, passwordHash, safeRole, vendorStore ?? null],
    );

    return { token: this.signToken(created[0]), role: created[0].role };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; role: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();

    // ── Step 1: check admins table first ────────────────────────────────────
    const admins = await this.databaseService.query<AdminRecord>(
      'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
      [normalizedEmail],
    );
    if (admins.length > 0) {
      const isValid = await bcrypt.compare(password, admins[0].password_hash);
      if (!isValid) throw new UnauthorizedException('Invalid email or password');
      return { token: this.signAdminToken(admins[0]), role: 'admin' };
    }

    // ── Step 2: check delivery_boys table ───────────────────────────────────
    const deliveryBoys = await this.databaseService.query<DeliveryBoyRecord>(
      'SELECT id, name, email, password_hash, phone, vehicle_type, is_available FROM delivery_boys WHERE email = $1',
      [normalizedEmail],
    );
    if (deliveryBoys.length > 0) {
      const isValid = await bcrypt.compare(password, deliveryBoys[0].password_hash);
      if (!isValid) throw new UnauthorizedException('Invalid email or password');
      return { token: this.signDeliveryToken(deliveryBoys[0]), role: 'delivery' };
    }

    // ── Step 3: check users table ────────────────────────────────────────────
    const users = await this.databaseService.query<UserRecord>(
      'SELECT id, name, email, password_hash, role, vendor_store FROM users WHERE email = $1',
      [normalizedEmail],
    );
    if (users.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, users[0].password_hash);
    if (!isValid) throw new UnauthorizedException('Invalid email or password');

    return { token: this.signToken(users[0]), role: users[0].role };
  }

  private signToken(user: UserRecord): string {
    const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
    return jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.vendor_store ?? undefined,
      },
      secret,
      { expiresIn: '7d' },
    );
  }

  private signAdminToken(admin: AdminRecord): string {
    const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
    return jwt.sign(
      {
        sub: `admin_${admin.id}`,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
      secret,
      { expiresIn: '12h' },
    );
  }

  private signDeliveryToken(db: DeliveryBoyRecord): string {
    const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
    return jwt.sign(
      {
        sub: db.id,
        name: db.name,
        email: db.email,
        role: 'delivery',
        vehicle: db.vehicle_type,
      },
      secret,
      { expiresIn: '12h' },
    );
  }

  private assertDatabaseConfigured(): void {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException(
        'DATABASE_URL is not configured. Add Neon connection string in .env',
      );
    }
  }
}
