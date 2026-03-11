import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { DatabaseService } from './database.service';
import type { Product } from './app.service';
import type { AddToCartDto } from './cart.service';

interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  role: string;
  store?: string;
}

function decodeToken(authHeader: string | undefined): JwtPayload {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET ?? 'change_me_in_env';
  try {
    return jwt.verify(token, secret) as unknown as JwtPayload;
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

function requireRole(payload: JwtPayload, ...roles: string[]): void {
  if (!roles.includes(payload.role)) {
    throw new ForbiddenException(`Access restricted to: ${roles.join(', ')}`);
  }
}

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly databaseService: DatabaseService,
  ) {}


  @Get('categories')
  async getCategories() {
    type Row = { id: number; name: string };
    const rows = await this.databaseService.query<Row>(
      `SELECT id, name FROM categories WHERE active = 1 ORDER BY name ASC`
    );
    return rows;
  }

  @Post('categories')
  async createCategory(
    @Headers('authorization') auth: string,
    @Body() body: { name: string },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor', 'admin');

    if (!body.name?.trim()) {
      throw new BadRequestException('Category name is required');
    }
    const name = body.name.trim();

    try {
      type Row = { id: number; name: string };
      const [inserted] = await this.databaseService.query<Row>(
        `INSERT INTO categories (name) VALUES ($1) RETURNING id, name`,
        [name]
      );
      return inserted;
    } catch (e: any) {
      if (e.code === '23505') { // Postgres unique violation error code
        throw new BadRequestException('Category already exists');
      }
      throw new BadRequestException('Failed to create category');
    }
  }

  @Delete('categories/:id')
  async deleteCategory(
    @Headers('authorization') auth: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');

    const [deleted] = await this.databaseService.query(
      `DELETE FROM categories WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!deleted) throw new NotFoundException('Category not found');
    return { success: true };
  }

  @Get('products/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    // Client passes ID with 900000 offet.
    const dbId = id >= 900000 ? id - 900000 : id;
    
    type DbRow = {
      id: number; trnum: string; vendor_id: number; vendor_store: string;
      name: string; description: string; price: string; old_price: string | null;
      currency: string; image: string; category: string;
      in_stock: boolean; stock_count: number;
    };
    const rows = await this.databaseService.query<DbRow>(
      `SELECT * FROM vendor_products WHERE id = $1`,
      [dbId],
    );
    if (rows.length === 0) throw new NotFoundException(`Product ${id} not found`);
    const r = rows[0];
    return {
      id:          900000 + r.id,
      trnum:       r.trnum,
      name:        r.name,
      description: r.description,
      price:       parseFloat(r.price),
      oldPrice:    r.old_price ? parseFloat(r.old_price) : 0,
      currency:    r.currency,
      image:       (r.image && r.image.trim() !== '') ? r.image : 'https://picsum.photos/seed/vp' + r.id + '/900/600',
      category:    r.category,
      store:       r.vendor_store,
      inStock:     r.in_stock,
      rating:      4.0,
      stockCount:  r.stock_count,
    };
  }

  /** Public: all registered vendors (for shop vendor filter — no auth needed) */
  @Get('vendors')
  async getVendors() {
    type Row = { id: number; name: string; vendor_store: string };
    const rows = await this.databaseService.query<Row>(
      `SELECT id, name, vendor_store FROM users WHERE role = 'vendor' AND vendor_store IS NOT NULL ORDER BY name ASC`,
    );
    return rows.map(r => ({ id: r.id, name: r.name, store: r.vendor_store }));
  }

  @Get('stores/:username/products')
  async getProductsByStore(@Param('username') username: string) {
    type DbRow = {
      id: number; trnum: string; vendor_id: number; vendor_store: string;
      name: string; description: string; price: string; old_price: string | null;
      currency: string; image: string; category: string;
      in_stock: boolean; stock_count: number;
      is_open: boolean;
    };
    const rows = await this.databaseService.query<DbRow>(
      `SELECT vp.*, u.is_open 
       FROM vendor_products vp 
       JOIN users u ON u.vendor_store = vp.vendor_store
       WHERE vp.vendor_store = $1
       ORDER BY vp.created_at DESC`,
      [username]
    );
    return rows.map(r => ({
      id: 900000 + r.id,
      trnum: r.trnum,
      name: r.name,
      description: r.description,
      price: parseFloat(r.price),
      oldPrice: r.old_price ? parseFloat(r.old_price) : 0,
      currency: r.currency,
      image: (r.image && r.image.trim() !== '') ? r.image : 'https://picsum.photos/seed/vp' + r.id + '/900/600',
      category: r.category,
      store: r.vendor_store,
      inStock: r.in_stock,
      rating: 4.0,
      stockCount: r.stock_count,
    }));
  }

  // ── Vendor Products (DB) ───────────────────────────────────────────────────

  /** GET /api/products — static mock + DB vendor products merged */
  @Get('products')
  async getAllProducts() {
    type DbRow = {
      id: number; trnum: string; vendor_id: number; vendor_store: string;
      name: string; description: string; price: string; old_price: string | null;
      currency: string; image: string; category: string;
      in_stock: boolean; stock_count: number;
      is_open: boolean;
    };
    const rows = await this.databaseService.query<DbRow>(
      `SELECT vp.*, u.is_open 
       FROM vendor_products vp
       JOIN users u ON u.vendor_store = vp.vendor_store
       ORDER BY vp.created_at DESC`,
    );
    const dbProducts = rows.map(r => ({
      id: 900000 + r.id,           // offset to avoid clash with mock ids
      trnum: r.trnum,
      name: r.name,
      description: r.description,
      price: parseFloat(r.price),
      oldPrice: r.old_price ? parseFloat(r.old_price) : 0,
      currency: r.currency,
      image: (r.image && r.image.trim() !== '') ? r.image : 'https://picsum.photos/seed/vendor-product/900/600',
      category: r.category,
      store: r.vendor_store,
      inStock: r.in_stock,
      rating: 4.0,
      stockCount: r.stock_count,
    }));
    return dbProducts;
  }

  /** POST /api/vendor/products — upload a new product (vendor auth required) */
  @Post('vendor/products')
  async addVendorProduct(
    @Headers('authorization') auth: string,
    @Body() body: {
      name: string; description: string; price: number; oldPrice?: number;
      category?: string; image?: string; stockCount?: number;
    },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');

    if (!body.name?.trim() || !body.price) {
      throw new BadRequestException('name and price are required');
    }
    if (!p.store) {
      throw new BadRequestException('Your account has no store. Please contact support.');
    }

    // Count existing vendor products to generate sequential part
    type CountRow = { count: string };
    const [{ count }] = await this.databaseService.query<CountRow>(
      `SELECT COUNT(*) as count FROM vendor_products WHERE vendor_id = $1`,
      [p.sub],
    );
    const seq = parseInt(count) + 1;

    // Build trnum: VEN_ + last 4 digits of vendor_id padded + '-' + seq padded 4
    const vendorSuffix = String(p.sub).padStart(4, '0').slice(-4);
    const seqPart      = String(seq).padStart(4, '0');
    const trnum        = `VEN_${vendorSuffix}-${seqPart}`;

    type InsertRow = { id: number; trnum: string };
    const [inserted] = await this.databaseService.query<InsertRow>(
      `INSERT INTO vendor_products (trnum, vendor_id, vendor_store, name, description, price, old_price, image, category, stock_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, trnum`,
      [trnum, p.sub, p.store, body.name.trim(), body.description ?? '', body.price,
       body.oldPrice ?? null, body.image ?? '', body.category ?? 'General', body.stockCount ?? 0],
    );

    return { success: true, trnum: inserted.trnum, id: inserted.id };
  }

  /** GET /api/vendor/products — list own products */
  @Get('vendor/products')
  async listVendorProducts(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');
    type Row = {
      id: number; trnum: string; name: string; description: string;
      price: string; old_price: string | null; category: string;
      image: string; in_stock: boolean; stock_count: number; created_at: string;
    };
    return this.databaseService.query<Row>(
      `SELECT id, trnum, name, description, price, old_price, category, image, in_stock, stock_count, created_at
       FROM vendor_products WHERE vendor_id = $1 ORDER BY created_at DESC`,
      [p.sub],
    );
  }



  @Post('auth/register')
  async register(
    @Body() body: { name?: string; email?: string; password?: string; role?: string; vendor_store?: string; phone?: string; vehicle_type?: string },
  ): Promise<{ token: string; role: string }> {
    const { name, email, password, role, vendor_store, phone, vehicle_type } = body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      throw new BadRequestException('name, email and password are required');
    }
    return this.authService.register(name.trim(), email.trim(), password.trim(), role, vendor_store, phone, vehicle_type);
  }

  @Post('auth/login')
  async login(
    @Body() body: { email?: string; password?: string },
  ): Promise<{ token: string; role: string }> {
    const { email, password } = body;
    if (!email?.trim() || !password?.trim()) {
      throw new BadRequestException('email and password are required');
    }
    return this.authService.login(email.trim(), password.trim());
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  @Get('cart')
  async getCart(@Headers('authorization') auth: string) {
    const { sub } = decodeToken(auth);
    return this.cartService.getCart(sub);
  }

  @Post('cart')
  async addToCart(@Headers('authorization') auth: string, @Body() body: AddToCartDto) {
    const { sub } = decodeToken(auth);
    if (!body.product_id || !body.product_name) throw new BadRequestException('product_id and product_name required');
    return this.cartService.addToCart(sub, body);
  }

  @Delete('cart/:productId')
  async removeFromCart(@Headers('authorization') auth: string, @Param('productId', ParseIntPipe) productId: number) {
    const { sub } = decodeToken(auth);
    return this.cartService.removeFromCart(sub, productId);
  }

  // ── Orders (user) ─────────────────────────────────────────────────────────

  @Get('orders')
  async getOrders(@Headers('authorization') auth: string) {
    const { sub } = decodeToken(auth);
    return this.orderService.getOrders(sub);
  }

  @Post('orders/:cartItemId')
  async placeOrder(
    @Headers('authorization') auth: string, 
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body('paymentMethod') paymentMethod?: string,
    @Body('fulfillmentType') fulfillmentType: string = 'delivery',
  ) {
    const { sub } = decodeToken(auth);
    return this.orderService.placeOrder(sub, cartItemId, paymentMethod, fulfillmentType);
  }

  @Get('orders/priority-queue-count')
  async getPriorityQueueCount() {
    const count = await this.orderService.getPriorityQueueCount();
    return { count };
  }

  @Post('orders/checkout/all')
  async checkoutCart(
    @Headers('authorization') auth: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('fulfillmentType') fulfillmentType: string,
    @Body('fulfillmentDetails') fulfillmentDetails?: string,
    @Body('isPriority') isPriority?: boolean,
  ) {
    const { sub } = decodeToken(auth);
    if (!paymentMethod || !fulfillmentType) throw new BadRequestException('paymentMethod and fulfillmentType are required');
    return this.orderService.checkoutCart(sub, paymentMethod, fulfillmentType, fulfillmentDetails, isPriority);
  }

  @Post('orders/checkout/razorpay-init')
  async initCartRazorpay(
    @Headers('authorization') auth: string,
    @Body('fulfillmentType') fulfillmentType: string,
    @Body('isPriority') isPriority: boolean = false,
  ) {
    const { sub } = decodeToken(auth);
    if (!fulfillmentType) throw new BadRequestException('fulfillmentType is required');
    return this.orderService.createCartRazorpayOrder(sub, fulfillmentType, isPriority);
  }

  @Post('orders/checkout/razorpay-verify')
  async verifyCartRazorpay(
    @Headers('authorization') auth: string,
    @Body('fulfillmentType') fulfillmentType: string,
    @Body('fulfillmentDetails') fulfillmentDetails: string | undefined,
    @Body('isPriority') isPriority: boolean = false,
    @Body('razorpayPaymentId') razorpayPaymentId: string,
    @Body('razorpayOrderId') razorpayOrderId: string,
    @Body('razorpaySignature') razorpaySignature: string,
  ) {
    const { sub } = decodeToken(auth);
    return this.orderService.verifyCartRazorpayPayment(
      sub,
      fulfillmentType,
      fulfillmentDetails,
      isPriority,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    );
  }

  @Patch('orders/:orderId/advance')
  async advanceStatus(@Headers('authorization') auth: string, @Param('orderId', ParseIntPipe) orderId: number) {
    const { sub } = decodeToken(auth);
    return this.orderService.advanceStatus(sub, orderId);
  }

  @Post('orders/:orderId/create-razorpay-order')
  async createRazorpayOrder(@Headers('authorization') auth: string, @Param('orderId', ParseIntPipe) orderId: number) {
    const { sub } = decodeToken(auth);
    return this.orderService.createRazorpayOrder(sub, orderId);
  }

  @Post('orders/:orderId/pay')
  async payForOrder(
    @Headers('authorization') auth: string,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('razorpayPaymentId') razorpayPaymentId: string,
    @Body('razorpayOrderId') razorpayOrderId: string,
    @Body('razorpaySignature') razorpaySignature: string,
  ) {
    const { sub } = decodeToken(auth);
    return this.orderService.payForOrder(sub, orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature);
  }

  /** User confirms delivery — sets order status to "delivered" */
  @Patch('orders/:orderId/received')
  async markReceived(@Headers('authorization') auth: string, @Param('orderId', ParseIntPipe) orderId: number) {
    const { sub } = decodeToken(auth);
    // Verify this order belongs to the caller
    type Row = { id: number; user_id: number; status: string };
    const [order] = await this.databaseService.query<Row>(
      `SELECT id, user_id, status FROM orders WHERE id = $1`,
      [orderId],
    );
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.user_id !== sub) throw new ForbiddenException('Not your order');
    if (order.status === 'delivered') {
      return order; // already done, idempotent
    }
    const [updated] = await this.databaseService.query<Row>(
      `UPDATE orders SET status = 'delivered' WHERE id = $1 RETURNING *`,
      [orderId],
    );
    return updated;
  }

  @Get('checkout/fulfillment-options')
  async getCheckoutFulfillmentOptions(@Headers('authorization') auth: string) {
    const { sub } = decodeToken(auth);
    // 1. Get the user's cart
    const cartItems = await this.cartService.getCart(sub);
    if (cartItems.length === 0) {
      return { delivery: true, pickup: true, table: true, queue: true }; // default if empty
    }

    // 2. Identify all distinct vendors (stores) in the cart
    const stores = Array.from(new Set(cartItems.map(item => item.product_store).filter(Boolean)));
    if (stores.length === 0) {
      return { delivery: true, pickup: true, table: true, queue: true }; 
    }

    // 3. Query the users table for these stores
    type StoreFlags = { allow_delivery: boolean; allow_pickup: boolean; allow_table: boolean; allow_queue: boolean };
    const vendorFlags = await this.databaseService.query<StoreFlags>(
      `SELECT allow_delivery, allow_pickup, allow_table, allow_queue FROM users WHERE vendor_store = ANY($1)`,
      [stores]
    );

    if (vendorFlags.length === 0) {
      return { delivery: true, pickup: true, table: true, queue: true };
    }

    // 4. Intersect the flags (all vendors must allow it)
    let delivery = true;
    let pickup = true;
    let table = true;
    let queue = true;

    for (const flags of vendorFlags) {
      if (!flags.allow_delivery) delivery = false;
      if (!flags.allow_pickup) pickup = false;
      if (!flags.allow_table) table = false;
      if (!flags.allow_queue) queue = false;
    }

    return { delivery, pickup, table, queue };
  }

  // ── Vendor ────────────────────────────────────────────────────────────────

  @Get('vendor/settings')
  async getVendorSettings(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');
    const [user] = await this.databaseService.query(
      `SELECT policy_delivery, policy_pickup, policy_table, policy_queue, allow_delivery, allow_pickup, allow_table, allow_queue, is_open, store_address FROM users WHERE id = $1`, [p.sub]
    );
    if (!user) throw new NotFoundException('Vendor not found');
    return user;
  }

  @Patch('vendor/settings')
  async updateVendorSettings(
    @Headers('authorization') auth: string,
    @Body() body: { 
      policy_delivery?: string;
      policy_pickup?: string;
      policy_table?: string;
      policy_queue?: string;
      allow_delivery?: boolean; 
      allow_pickup?: boolean; 
      allow_table?: boolean; 
      allow_queue?: boolean;
      is_open?: boolean;
      store_address?: string;
    }
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');
    
    for (const policy of [body.policy_delivery, body.policy_pickup, body.policy_table, body.policy_queue]) {
      if (policy && !['pay_before', 'pay_after'].includes(policy)) {
        throw new BadRequestException('Policies must be pay_before or pay_after');
      }
    }

    await this.databaseService.query(
      `UPDATE users 
       SET policy_delivery = COALESCE($1, policy_delivery),
           policy_pickup   = COALESCE($2, policy_pickup),
           policy_table    = COALESCE($3, policy_table),
           policy_queue    = COALESCE($4, policy_queue),
           allow_delivery  = COALESCE($5, allow_delivery),
           allow_pickup    = COALESCE($6, allow_pickup),
           allow_table     = COALESCE($7, allow_table),
           allow_queue     = COALESCE($8, allow_queue),
           is_open         = COALESCE($9, is_open),
           store_address   = COALESCE($10, store_address)
       WHERE id = $11`,
      [
        body.policy_delivery ?? null, 
        body.policy_pickup ?? null, 
        body.policy_table ?? null, 
        body.policy_queue ?? null, 
        body.allow_delivery ?? null, 
        body.allow_pickup ?? null, 
        body.allow_table ?? null, 
        body.allow_queue ?? null, 
        body.is_open ?? null,
        body.store_address ?? null,
        p.sub
      ]
    );
    return { success: true };
  }

  @Get('public/vendor/:store/policy')
  async getPublicVendorPolicy(@Param('store') storeName: string) {
    const [user] = await this.databaseService.query(
      `SELECT policy_delivery, policy_pickup, policy_table, policy_queue FROM users WHERE vendor_store = $1 AND role = 'vendor'`,
      [storeName]
    );
    if (!user) throw new NotFoundException('Vendor not found');
    return user;
  }

  /** Get all orders that contain the vendor's products (matched by store name) */
  @Get('vendor/orders')
  async getVendorOrders(@Headers('authorization') auth: string) {
    const payload = decodeToken(auth);
    requireRole(payload, 'vendor', 'admin');
    // Fetch all orders and filter by vendor_store
    const allOrders = await this.orderService.getAllOrders();
    if (payload.role === 'admin') return allOrders;
    return allOrders.filter((o) => o.product_store === payload.store);
  }

  /** Vendor updates order status directly (full control — used from vendor dashboard) */
  @Patch('vendor/orders/:orderId/status')
  async setOrderStatus(
    @Headers('authorization') auth: string,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { status: string },
  ) {
    const payload = decodeToken(auth);
    requireRole(payload, 'vendor', 'admin');
    return this.orderService.setStatus(orderId, body.status);
  }

  // NOTE: GET /api/vendor/products is handled by listVendorProducts above (line ~231) which correctly queries the DB.

  // ── Delivery Boy ──────────────────────────────────────────────────────────

  /** GET /delivery/orders — orders assigned to this delivery boy */
  @Get('delivery/orders')
  async getDeliveryOrders(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'delivery');
    type Row = {
      id: number; product_name: string; product_image: string;
      price: number; quantity: number; status: string; ordered_at: string;
      assigned_to: number | null;
    };
    return this.databaseService.query<Row>(
      `SELECT id, product_name, product_image, price, quantity, status, ordered_at, assigned_to
       FROM orders WHERE assigned_to = $1 ORDER BY ordered_at DESC`,
      [p.sub],
    );
  }

  /** PATCH /delivery/orders/:id/status — delivery boy updates their order status */
  @Patch('delivery/orders/:orderId/status')
  async updateDeliveryStatus(
    @Headers('authorization') auth: string,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { status: string },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'delivery');
    const allowed = ['in_transit', 'delivered'];
    if (!allowed.includes(body.status)) {
      throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);
    }
    type Row = { id: number; assigned_to: number | null };
    const [order] = await this.databaseService.query<Row>(
      `SELECT id, assigned_to FROM orders WHERE id = $1`,
      [orderId],
    );
    if (!order) throw new NotFoundException('Order not found');
    if (order.assigned_to !== p.sub) throw new ForbiddenException('Not assigned to you');
    const [updated] = await this.databaseService.query<Row>(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [body.status, orderId],
    );
    return updated;
  }

  /** GET /admin/delivery-boys — list all delivery boys */
  @Get('admin/delivery-boys')
  async listDeliveryBoys(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    type Row = { id: number; name: string; email: string; phone: string | null; vehicle_type: string; is_available: boolean; created_at: string };
    return this.databaseService.query<Row>(
      `SELECT id, name, email, phone, vehicle_type, is_available, created_at FROM delivery_boys ORDER BY created_at DESC`,
    );
  }

  /** POST /admin/orders/:orderId/assign/:deliveryBoyId — admin assigns order to delivery boy */
  @Post('admin/orders/:orderId/assign/:deliveryBoyId')
  async assignDeliveryBoy(
    @Headers('authorization') auth: string,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('deliveryBoyId', ParseIntPipe) deliveryBoyId: number,
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    const [updated] = await this.databaseService.query(
      `UPDATE orders SET assigned_to = $1, status = CASE WHEN status = 'ready' THEN 'in_transit' ELSE status END
       WHERE id = $2 RETURNING *`,
      [deliveryBoyId, orderId],
    );
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

  // ── Vendor Market (B2B) ──────────────────────────────────────────────────

  /** GET /market/products — list all market products (vendor + admin) */
  @Get('market/products')
  async getMarketProducts(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor', 'admin');
    type Row = {
      id: number; name: string; description: string; price: string;
      old_price: string | null; image: string | null; category: string;
      stock_count: number; created_at: string;
    };
    return this.databaseService.query<Row>(
      `SELECT * FROM market_products ORDER BY created_at DESC`,
    );
  }

  /** POST /market/orders — vendor buys a market product */
  @Post('market/orders')
  async buyMarketProduct(
    @Headers('authorization') auth: string,
    @Body() body: { product_id: number; quantity?: number },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');

    const qty = Math.max(1, Number(body.quantity ?? 1));
    type ProdRow = {
      id: number; name: string; image: string; price: string; stock_count: number;
    };
    const [prod] = await this.databaseService.query<ProdRow>(
      `SELECT id, name, image, price, stock_count FROM market_products WHERE id = $1`,
      [body.product_id],
    );
    if (!prod) throw new NotFoundException('Market product not found');
    if (prod.stock_count < qty) throw new BadRequestException(`Only ${prod.stock_count} units in stock`);

    // Generate unique order number (same suffix strategy as regular orders)
    const crypto = require('crypto') as typeof import('crypto');
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const now    = new Date();
    const date   = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const suffix = Array.from(crypto.randomBytes(8)).map(b => chars[b % chars.length]).join('');
    const orderNumber = `MKT-${date}-${suffix}`;

    const [order] = await this.databaseService.query(
      `INSERT INTO market_orders (order_number, vendor_id, vendor_store, product_id, product_name, product_image, price, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [orderNumber, p.sub, p.store ?? null, prod.id, prod.name, prod.image ?? null,
       parseFloat(prod.price), qty],
    );
    // Deduct stock safely (never below 0)
    await this.databaseService.query(
      `UPDATE market_products SET stock_count = GREATEST(0, stock_count - $1) WHERE id = $2`,
      [qty, prod.id],
    );
    return order;
  }

  /** GET /market/orders — vendor's own purchase history */
  @Get('market/orders')
  async getMyMarketOrders(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor', 'admin');
    if (p.role === 'admin') {
      return this.databaseService.query(
        `SELECT mo.*, u.name AS vendor_name, u.vendor_store
         FROM market_orders mo
         JOIN users u ON u.id = mo.vendor_id
         ORDER BY mo.ordered_at DESC`,
      );
    }
    return this.databaseService.query(
      `SELECT * FROM market_orders WHERE vendor_id = $1 ORDER BY ordered_at DESC`,
      [p.sub],
    );
  }

  // ── AR/VR Models ────────────────────────────────────────────────────────
  @Get('admin/ar-models')
  async getAdminArModels(@Headers('authorization') auth: string) {
    requireRole(decodeToken(auth), 'admin');
    return this.databaseService.query(`
      SELECT m.*, 
        COALESCE(json_agg(json_build_object('vendor_store', v.vendor_store, 'granted_at', v.granted_at)) FILTER (WHERE v.vendor_store IS NOT NULL), '[]') as access_list
      FROM ar_models m
      LEFT JOIN vendor_ar_access v ON v.model_id = m.id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);
  }

  @Post('admin/ar-models')
  async createArModel(@Headers('authorization') auth: string, @Body() body: any) {
    requireRole(decodeToken(auth), 'admin');
    const { name, model_url } = body;
    if (!name) throw new BadRequestException('name is required');
    // Using default burger models if not provided
    const url = model_url || 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

    const [model] = await this.databaseService.query(
      `INSERT INTO ar_models (name, model_url) VALUES ($1, $2) RETURNING *`,
      [name, url],
    );
    return model;
  }

  @Post('admin/ar-models/:id/grant')
  async grantArModelAccess(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    requireRole(decodeToken(auth), 'admin');
    const { vendor_store } = body;
    if (!vendor_store) throw new BadRequestException('vendor_store is required');

    await this.databaseService.query(
      `INSERT INTO vendor_ar_access (vendor_store, model_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [vendor_store, parseInt(id, 10)],
    );
    return { status: 'success' };
  }

  @Delete('admin/ar-models/:id/grant/:vendor_store')
  async revokeArModelAccess(@Headers('authorization') auth: string, @Param('id') id: string, @Param('vendor_store') vendorStore: string) {
    requireRole(decodeToken(auth), 'admin');
    await this.databaseService.query(
      `DELETE FROM vendor_ar_access WHERE model_id = $1 AND vendor_store = $2`,
      [parseInt(id, 10), vendorStore],
    );
    return { status: 'success' };
  }

  @Delete('admin/ar-models/:id')
  async deleteArModel(@Headers('authorization') auth: string, @Param('id') id: string) {
    requireRole(decodeToken(auth), 'admin');
    await this.databaseService.query(`DELETE FROM ar_models WHERE id = $1`, [parseInt(id, 10)]);
    return { status: 'success' };
  }

  @Patch('admin/ar-models/:id')
  async editArModel(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    requireRole(decodeToken(auth), 'admin');
    const { name, model_url } = body;
    if (!name || !model_url) throw new BadRequestException('name and model_url are required');
    await this.databaseService.query(
      `UPDATE ar_models SET name = $1, model_url = $2 WHERE id = $3`,
      [name, model_url, parseInt(id, 10)],
    );
    return { status: 'success' };
  }

  @Get('vendor/ar-models')
  async getVendorArModels(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'vendor');
    
    console.log("[DEBUG] Fetching AR models for vendor store:", (p as any).store);

    return this.databaseService.query(`
      SELECT m.*, v.granted_at
      FROM vendor_ar_access v
      JOIN ar_models m ON m.id = v.model_id
      WHERE v.vendor_store = $1
      ORDER BY v.granted_at DESC
    `, [(p as any).store]);
  }

  @Get('public/ar-models/:id')
  async getPublicArModel(@Param('id') id: string) {
    const [model] = await this.databaseService.query(
      `SELECT * FROM ar_models WHERE id = $1`, [parseInt(id, 10)]
    );
    if (!model) throw new NotFoundException('AR Model not found');
    return model;
  }

  // ── Admin: Market product management ──────────────────────────────────────

  /** POST /admin/market/products — admin adds a market product */
  @Post('admin/market/products')
  async addMarketProduct(
    @Headers('authorization') auth: string,
    @Body() body: { name: string; description?: string; price: number; old_price?: number; image?: string; category?: string; stock_count?: number },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    if (!body.name?.trim() || !body.price) throw new BadRequestException('name and price required');
    const [prod] = await this.databaseService.query(
      `INSERT INTO market_products (name, description, price, old_price, image, category, stock_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [body.name.trim(), body.description ?? null, body.price,
       body.old_price ?? null, body.image ?? null,
       body.category ?? 'General', body.stock_count ?? 0],
    );
    return prod;
  }

  /** PATCH /admin/market/products/:id — admin edits a market product */
  @Patch('admin/market/products/:id')
  async editMarketProduct(
    @Headers('authorization') auth: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string; price?: number; old_price?: number; image?: string; category?: string; stock_count?: number },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    const [prod] = await this.databaseService.query(
      `UPDATE market_products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           old_price = COALESCE($4, old_price),
           image = COALESCE($5, image),
           category = COALESCE($6, category),
           stock_count = COALESCE($7, stock_count)
       WHERE id = $8 RETURNING *`,
      [body.name ?? null, body.description ?? null, body.price ?? null,
       body.old_price ?? null, body.image ?? null, body.category ?? null,
       body.stock_count ?? null, id],
    );
    if (!prod) throw new NotFoundException('Market product not found');
    return prod;
  }

  /** DELETE /admin/market/products/:id — admin removes a market product */
  @Delete('admin/market/products/:id')
  async deleteMarketProduct(
    @Headers('authorization') auth: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    await this.databaseService.query(`DELETE FROM market_products WHERE id = $1`, [id]);
    return { deleted: true, id };
  }

  /** GET /admin/market/orders — admin sees all vendor market orders */
  @Get('admin/market/orders')
  async getAllMarketOrders(@Headers('authorization') auth: string) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    return this.databaseService.query(
      `SELECT mo.*, u.name AS vendor_name, u.vendor_store
       FROM market_orders mo
       JOIN users u ON u.id = mo.vendor_id
       ORDER BY mo.ordered_at DESC`,
    );
  }

  /** PATCH /admin/market/orders/:id/status — admin updates market order status */
  @Patch('admin/market/orders/:id/status')
  async updateMarketOrderStatus(
    @Headers('authorization') auth: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    const p = decodeToken(auth);
    requireRole(p, 'admin');
    const [updated] = await this.databaseService.query(
      `UPDATE market_orders SET status = $1 WHERE id = $2 RETURNING *`,
      [body.status, id],
    );
    if (!updated) throw new NotFoundException('Market order not found');
    return updated;
  }

  // ── Admin ─────────────────────────────────────────────────────────────────



  /** Admin: per-vendor summary — product count, order count, total revenue */
  @Get('admin/stats')
  async getAdminStats(@Headers('authorization') auth: string) {
    const payload = decodeToken(auth);
    requireRole(payload, 'admin');
    const allOrders = await this.orderService.getAllOrders();
    const products = this.appService.getProducts();

    // Group products by store
    const storeMap: Record<string, { products: number; orders: number; revenue: number }> = {};
    for (const p of products) {
      if (!storeMap[p.store]) storeMap[p.store] = { products: 0, orders: 0, revenue: 0 };
      storeMap[p.store].products++;
    }
    for (const o of allOrders) {
      const store = o.product_store ?? 'unknown';
      if (!storeMap[store]) storeMap[store] = { products: 0, orders: 0, revenue: 0 };
      storeMap[store].orders++;
      storeMap[store].revenue += Number(o.price) * o.quantity;
    }

    return Object.entries(storeMap).map(([store, stats]) => ({ store, ...stats }));
  }

  /** Admin: drill-down — all orders for a specific vendor store with per-product breakdown */
  @Get('admin/vendors/:store/orders')
  async getVendorOrderBreakdown(
    @Headers('authorization') auth: string,
    @Param('store') store: string,
  ) {
    const payload = decodeToken(auth);
    requireRole(payload, 'admin');
    const allOrders = await this.orderService.getAllOrders();
    const vendorOrders = allOrders.filter(o => (o.product_store ?? 'unknown') === store);

    // Per-product summary
    const productMap: Record<string, { product_id: number; product_name: string; product_image: string; qty: number; revenue: number; orders: { id: number; status: string; ordered_at: string }[] }> = {};
    for (const o of vendorOrders) {
      const key = String(o.product_id);
      if (!productMap[key]) {
        productMap[key] = { product_id: o.product_id, product_name: o.product_name, product_image: o.product_image, qty: 0, revenue: 0, orders: [] };
      }
      productMap[key].qty += o.quantity;
      productMap[key].revenue += Number(o.price) * o.quantity;
      productMap[key].orders.push({ id: o.id, status: o.status, ordered_at: o.ordered_at });
    }

    return {
      store,
      total_orders: vendorOrders.length,
      total_revenue: vendorOrders.reduce((s, o) => s + Number(o.price) * o.quantity, 0),
      products: Object.values(productMap),
    };
  }

  // Platform margin rate (10% → admin keeps 10%, vendor keeps 90%)
  private readonly PLATFORM_MARGIN = 0.10;

  /** Admin: all registered vendors (from users table) with revenue + profit after margin */
  @Get('admin/registered-vendors')
  async getRegisteredVendors(@Headers('authorization') auth: string) {
    const payload = decodeToken(auth);
    requireRole(payload, 'admin');

    type VendorRow = { id: number; name: string; email: string; vendor_store: string | null; created_at: string };
    const vendors = await this.databaseService.query<VendorRow>(
      `SELECT id, name, email, vendor_store, created_at FROM users WHERE role = 'vendor' ORDER BY created_at DESC`,
    );

    const allOrders = await this.orderService.getAllOrders();

    return vendors.map(v => {
      const storeOrders = allOrders.filter(o => (o.product_store ?? '') === (v.vendor_store ?? ''));
      const gross    = storeOrders.reduce((s, o) => s + Number(o.price) * o.quantity, 0);
      const margin   = gross * this.PLATFORM_MARGIN;
      const profit   = gross - margin;
      const products = this.appService.getProductsByStore(v.vendor_store ?? '');
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        store: v.vendor_store,
        product_count: products.length,
        order_count: storeOrders.length,
        gross_revenue: gross,
        platform_margin: margin,
        vendor_profit: profit,
        joined: v.created_at,
      };
    });
  }

  /** Admin: all registered users with total orders + total spent */
  @Get('admin/users')
  async getRegisteredUsers(@Headers('authorization') auth: string) {
    const payload = decodeToken(auth);
    requireRole(payload, 'admin');

    type UserRow = { id: number; name: string; email: string; created_at: string };
    const users = await this.databaseService.query<UserRow>(
      `SELECT id, name, email, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC`,
    );

    const allOrders = await this.orderService.getAllOrders();

    return users.map(u => {
      const userOrders = allOrders.filter(o => o.user_id === u.id);
      const spent = userOrders.reduce((s, o) => s + Number(o.price) * o.quantity, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        order_count: userOrders.length,
        total_spent: spent,
        joined: u.created_at,
      };
    });
  }

  /** Admin: all orders + products for a specific user */
  @Get('admin/users/:userId/orders')
  async getUserOrders(
    @Headers('authorization') auth: string,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const payload = decodeToken(auth);
    requireRole(payload, 'admin');

    const allOrders = await this.orderService.getAllOrders();
    const userOrders = allOrders.filter(o => o.user_id === userId);

    const productMap: Record<string, { product_id: number; product_name: string; product_image: string; qty: number; spent: number; orders: { id: number; status: string; ordered_at: string }[] }> = {};
    for (const o of userOrders) {
      const key = String(o.product_id);
      if (!productMap[key]) {
        productMap[key] = { product_id: o.product_id, product_name: o.product_name, product_image: o.product_image, qty: 0, spent: 0, orders: [] };
      }
      productMap[key].qty += o.quantity;
      productMap[key].spent += Number(o.price) * o.quantity;
      productMap[key].orders.push({ id: o.id, status: o.status, ordered_at: o.ordered_at });
    }

    return {
      user_id: userId,
      total_orders: userOrders.length,
      total_spent: userOrders.reduce((s, o) => s + Number(o.price) * o.quantity, 0),
      products: Object.values(productMap),
    };
  }
}

