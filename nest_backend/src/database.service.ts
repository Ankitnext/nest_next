import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';
import * as bcrypt from 'bcryptjs';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@novacart.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@2026!';
const ADMIN_NAME     = 'Super Admin';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      return;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vendor_store VARCHAR(120);
      ALTER TABLE users DROP COLUMN IF EXISTS payment_policy;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS policy_delivery VARCHAR(20) NOT NULL DEFAULT 'pay_after';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS policy_pickup VARCHAR(20) NOT NULL DEFAULT 'pay_after';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS policy_table VARCHAR(20) NOT NULL DEFAULT 'pay_after';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS policy_queue VARCHAR(20) NOT NULL DEFAULT 'pay_after';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_delivery BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_pickup BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_table BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_queue BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS store_address VARCHAR(255);

      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        quantity INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0,
        UNIQUE(user_id, product_id)
      );

      CREATE INDEX IF NOT EXISTS cart_user_id_idx ON cart(user_id);

      ALTER TABLE cart ADD COLUMN IF NOT EXISTS product_store TEXT;
      ALTER TABLE cart ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE cart ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE cart ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;


      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT NOT NULL,
        product_store TEXT,
        price NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        quantity INTEGER NOT NULL DEFAULT 1,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_store TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(30);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'delivery';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_details TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;
      CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_idx ON orders (order_number) WHERE order_number IS NOT NULL;
      CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL DEFAULT 'Super Admin',
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE admins ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS vendor_products (
        id SERIAL PRIMARY KEY,
        trnum VARCHAR(20) NOT NULL UNIQUE,
        vendor_id INTEGER NOT NULL,
        vendor_store VARCHAR(120) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL,
        old_price NUMERIC(10,2),
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        image TEXT NOT NULL DEFAULT '',
        category VARCHAR(80) NOT NULL DEFAULT 'General',
        in_stock BOOLEAN NOT NULL DEFAULT true,
        stock_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS vendor_products_vendor_id_idx ON vendor_products(vendor_id);
      ALTER TABLE vendor_products ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE vendor_products ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE vendor_products ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS delivery_boys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        vehicle_type VARCHAR(60) NOT NULL DEFAULT 'Bike',
        is_available BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE delivery_boys ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE delivery_boys ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE delivery_boys ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_to INTEGER;
      CREATE INDEX IF NOT EXISTS orders_assigned_to_idx ON orders(assigned_to);

      -- ── B2B Vendor Market ────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS market_products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        description TEXT,
        price       NUMERIC(12,2) NOT NULL,
        old_price   NUMERIC(12,2),
        image       TEXT,
        category    VARCHAR(100) NOT NULL DEFAULT 'General',
        stock_count INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE market_products ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE market_products ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE market_products ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS market_orders (
        id            SERIAL PRIMARY KEY,
        order_number  VARCHAR(30) UNIQUE,
        vendor_id     INTEGER NOT NULL,
        vendor_store  TEXT,
        product_id    INTEGER NOT NULL,
        product_name  TEXT NOT NULL,
        product_image TEXT,
        price         NUMERIC(12,2) NOT NULL,
        quantity      INTEGER NOT NULL DEFAULT 1,
        status        VARCHAR(30) NOT NULL DEFAULT 'pending',
        ordered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS market_orders_vendor_id_idx ON market_orders(vendor_id);
      CREATE INDEX IF NOT EXISTS market_orders_product_id_idx ON market_orders(product_id);
      ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      -- ── AR/VR Models ─────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS ar_models (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        model_url   TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      ALTER TABLE ar_models ADD COLUMN IF NOT EXISTS dflag INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE ar_models ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE ar_models ADD COLUMN IF NOT EXISTS flag INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS vendor_ar_access (
        vendor_store  TEXT NOT NULL,
        model_id      INTEGER NOT NULL REFERENCES ar_models(id) ON DELETE CASCADE,
        granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (vendor_store, model_id)
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(80) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dflag INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        flag INTEGER NOT NULL DEFAULT 0
      );

      INSERT INTO categories (name) VALUES 
        ('Electronics'), ('Fashion'), ('Home'), ('Beauty'), ('Sports'), 
        ('Grocery'), ('General'), ('Software'), ('Utensils')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Seed admin account only if it doesn't exist to prevent the hash from changing on every restart
    const { rowCount } = await this.pool.query('SELECT id FROM admins WHERE email = $1', [ADMIN_EMAIL]);
    if (rowCount === 0) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await this.pool.query(
        `INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3)`,
        [ADMIN_NAME, ADMIN_EMAIL, hash],
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(text, params);
    return result.rows;
  }
}
