import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis | null;

  readonly isEnabled: boolean;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL not set — caching disabled. Set REDIS_URL in .env to enable.');
      this.client = null;
      this.isEnabled = false;
      return;
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.client.on('connect', () => this.logger.log('Redis connected ✅'));
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`),
    );

    this.client.connect().catch(() => {
      this.logger.error('Redis connection failed — cache will be skipped for this session.');
    });

    this.isEnabled = true;
  }

  /** Retrieve a cached value. Returns null on miss or if Redis is disabled. */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      if (raw === null) {
        this.logger.debug(`[Cache MISS] ${key}`);
        return null;
      }
      this.logger.debug(`[Cache HIT]  ${key}`);
      return JSON.parse(raw) as T;
    } catch {
      return null; // Redis hiccup — degrade gracefully
    }
  }

  /** Store a value in cache with a TTL (in seconds). */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Ignore — cache is best-effort
    }
  }

  /** Invalidate one or more cache keys. */
  async del(...keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
      this.logger.debug(`[Cache DEL]  ${keys.join(', ')}`);
    } catch {
      // Ignore
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
