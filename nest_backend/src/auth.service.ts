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
  phone: string | null;
  is_vendor: boolean;
  is_service_provider: boolean;
  is_delivery: boolean;
  service_type: string | null;
  experience: string | null;
  hourly_rate: number | null;
  vehicle_type: string | null;
};

type AdminRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

// Legacy support (fallback)
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
    serviceType?: string,
    experience?: string,
    hourlyRate?: number
  ): Promise<{ token: string; role: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();

    // Determine target flags based on the requested role update
    const addVendor = role === 'vendor';
    const addDelivery = role === 'delivery';
    const addService = role === 'service_provider';
    
    // Silently clamp role to 'user' for safety if an unknown string is sent
    const safeRole = role === 'admin' ? 'user' : role;

    const existingUsers = await this.databaseService.query<UserRecord>(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail],
    );

    let finalUser: UserRecord;

    if (existingUsers.length > 0) {
      // User exists. Upgrade their account if they provide right password.
      const existing = existingUsers[0];
      const isValid = await bcrypt.compare(password, existing.password_hash);
      
      if (!isValid) {
        throw new UnauthorizedException('Email is already registered. Please provide your current password to add a new role/feature to your existing account.');
      }

      const isVendorFinal = existing.is_vendor || addVendor;
      const isDeliveryFinal = existing.is_delivery || addDelivery;
      const isServiceFinal = existing.is_service_provider || addService;
      const storeFinal = vendorStore ?? existing.vendor_store;
      const phoneFinal = phone ?? existing.phone;
      const vehicleFinal = vehicleType ?? existing.vehicle_type;
      const srvTypeFinal = serviceType ?? existing.service_type;
      const expFinal = experience ?? existing.experience;
      const rateFinal = hourlyRate ?? existing.hourly_rate;

      const updated = await this.databaseService.query<UserRecord>(
        `UPDATE users SET 
          is_vendor = $1, is_delivery = $2, is_service_provider = $3,
          vendor_store = $4, phone = $5, vehicle_type = $6,
          service_type = $7, experience = $8, hourly_rate = $9
         WHERE email = $10
         RETURNING *`,
         [
           isVendorFinal, isDeliveryFinal, isServiceFinal,
           storeFinal, phoneFinal, vehicleFinal,
           srvTypeFinal, expFinal, rateFinal,
           normalizedEmail
         ]
      );
      finalUser = updated[0];
    } else {
      // Create new user account mapping everything to the unified table
      const passwordHash = await bcrypt.hash(password, 10);
      const inserted = await this.databaseService.query<UserRecord>(
        `INSERT INTO users (
           name, email, password_hash, role, vendor_store, phone, 
           is_vendor, is_delivery, is_service_provider, 
           vehicle_type, service_type, experience, hourly_rate
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          name.trim(), normalizedEmail, passwordHash, safeRole, vendorStore ?? null, phone ?? null,
          addVendor, addDelivery, addService, 
          vehicleType ?? null, serviceType ?? null, experience ?? null, hourlyRate ?? null
        ]
      );
      finalUser = inserted[0];
    }

    return { token: this.signToken(finalUser), role: finalUser.role };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; role: string }> {
    this.assertDatabaseConfigured();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check Admins table
    const admins = await this.databaseService.query<AdminRecord>(
      'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
      [normalizedEmail],
    );
    if (admins.length > 0) {
      const isValid = await bcrypt.compare(password, admins[0].password_hash);
      if (!isValid) throw new UnauthorizedException('Invalid email or password');
      return { token: this.signAdminToken(admins[0]), role: 'admin' };
    }

    // 2. Check Unified Users table
    const users = await this.databaseService.query<UserRecord>(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail],
    );
    if (users.length > 0) {
      const isValid = await bcrypt.compare(password, users[0].password_hash);
      if (!isValid) throw new UnauthorizedException('Invalid email or password');
      return { token: this.signToken(users[0]), role: users[0].role };
    }

    // 3. Fallback support for strictly old delivery boys table if any exist
    const deliveryBoys = await this.databaseService.query<DeliveryBoyRecord>(
      'SELECT * FROM delivery_boys WHERE email = $1',
      [normalizedEmail],
    );
    if (deliveryBoys.length > 0) {
      const isValid = await bcrypt.compare(password, deliveryBoys[0].password_hash);
      if (!isValid) throw new UnauthorizedException('Invalid email or password');
      return { token: this.signDeliveryToken(deliveryBoys[0]), role: 'delivery' };
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  private signToken(user: UserRecord): string {
    const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
    return jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // keeping for legacy/fallback
        store: user.vendor_store ?? undefined,
        isVendor: user.is_vendor,
        isDelivery: user.is_delivery,
        isServiceProvider: user.is_service_provider,
        vehicle: user.vehicle_type ?? undefined,
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
        isVendor: false,
        isDelivery: false,
        isServiceProvider: false,
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
        isVendor: false,
        isDelivery: true,
        isServiceProvider: false,
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
