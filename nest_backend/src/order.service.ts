import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SMd8cPKdsEm5mi';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'fx6f9jdy1Rf6pXptgSYU7TZK';
const isMockKey = razorpayKeyId.includes('placeholder');

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// The 7 stages of an order, in order
export const ORDER_STATUSES = [
  'pending_payment', // 0 — Needs to be paid before order becomes 'pending'
  'pending',       // 1 — Order placed
  'confirmed',     // 2 — Received by supplier
  'packing',       // 3 — Supplier packing
  'ready',         // 4 — Ready to deliver
  'in_transit',    // 5 — Out for delivery
  'delivered',     // 6 — Delivered ✓
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: number;
  order_number: string;   // e.g. ORD-20260228-A3F7K9Q2
  user_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;
  price: number;
  currency: string;
  quantity: number;
  status: OrderStatus;
  fulfillment_type: string;
  fulfillment_details?: string;
  is_priority: boolean;
  ordered_at: string;
}

export interface CartItemRow {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;
  price: number;
  currency: string;
  quantity: number;
}

/** Generate a unique order number: ORD-YYYYMMDD-XXXXXXXX
 *  The 8-char suffix uses crypto-random bytes → collision probability
 *  < 1 in 2.8 trillion per day, safe for any realistic scale.
 */
function generateOrderNumber(): string {
  const now = new Date();
  const date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  // 8 random uppercase alphanumeric chars (A-Z, 0-9 → 36^8 ≈ 2.8T combinations)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const crypto = require('crypto') as typeof import('crypto');
  const bytes  = crypto.randomBytes(8);
  const suffix = Array.from(bytes)
    .map(b => chars[b % chars.length])
    .join('');

  return `ORD-${date}-${suffix}`;
}

@Injectable()
export class OrderService {
  constructor(private readonly db: DatabaseService) {}

  /** Get all orders for a user, newest first */
  getOrders(userId: number): Promise<Order[]> {
    return this.db.query<Order>(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY ordered_at DESC`,
      [userId],
    );
  }

  /** Get ALL orders across all users (admin/vendor use) */
  getAllOrders(): Promise<Order[]> {
    return this.db.query<Order>(
      `SELECT * FROM orders ORDER BY ordered_at DESC`,
    );
  }

  /** Directly set a specific status on any order (vendor/admin) */
  async setStatus(orderId: number, status: string): Promise<Order> {
    const updated = await this.db.query<Order>(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, orderId],
    );
    if (updated.length === 0) throw new Error('Order not found');
    return updated[0];
  }

  /** Convert a cart item into an actual order */
  async placeOrder(userId: number, cartItemId: number, paymentMethod?: string, fulfillmentType: string = 'delivery'): Promise<Order> {
    const cartRows = await this.db.query<CartItemRow>(
      `SELECT * FROM cart WHERE id = $1 AND user_id = $2`,
      [cartItemId, userId],
    );
    if (cartRows.length === 0) throw new NotFoundException('Cart item not found');
    const item = cartRows[0];
    
    // Determine vendor policy from store name based on fulfillment type
    let policy = 'pay_after';
    const store = item.product_store;
    if (store) {
       const [v] = await this.db.query<{ policy_delivery: string, policy_pickup: string, policy_table: string, policy_queue: string }>(
         `SELECT policy_delivery, policy_pickup, policy_table, policy_queue FROM users WHERE vendor_store = $1 AND role = 'vendor'`,
         [store]
       );
       if (v) {
         if (fulfillmentType === 'pickup') policy = v.policy_pickup;
         else if (fulfillmentType === 'table') policy = v.policy_table;
         else if (fulfillmentType === 'queue') policy = v.policy_queue;
         else policy = v.policy_delivery;
       }
    }

    let isPayBefore = policy === 'pay_before';
    if (paymentMethod === 'card') isPayBefore = true;
    if (paymentMethod === 'cod') isPayBefore = false;

    const initialStatus = isPayBefore ? 'pending_payment' : 'pending';

    // Retry up to 5 times in the astronomically unlikely case of collision
    let orderRows: Order[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = isPayBefore ? null : generateOrderNumber();
      try {
        orderRows = await this.db.query<Order>(
          `INSERT INTO orders (user_id, product_id, product_name, product_image, product_store, price, currency, quantity, status, order_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            userId, item.product_id, item.product_name, item.product_image,
            item.product_store ?? null,
            item.price, item.currency, item.quantity,
            initialStatus,
            orderNumber,
          ],
        );
        
        // Immediately subtract stock from the vendor if it's a vendor product
        if (item.product_id >= 900000) {
          const actualId = item.product_id - 900000;
          await this.db.query(
            `UPDATE vendor_products 
             SET stock_count = GREATEST(0, stock_count - $1) 
             WHERE id = $2`,
            [item.quantity, actualId]
          );
        }
        
        break; // success
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        if (pgErr.code === '23505' && attempt < 4) continue; // unique violation → retry
        throw err;
      }
    }

    await this.db.query(`DELETE FROM cart WHERE id = $1`, [cartItemId]);
    return orderRows[0];
  }

  /** Gets the number of orders currently in the priority queue */
  async getPriorityQueueCount(): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM orders WHERE is_priority = true AND status IN ('pending', 'confirmed', 'packing', 'ready')`
    );
    return parseInt(result[0].count, 10);
  }

  /** Bulk converts all items in a user's cart into orders */
  async checkoutCart(userId: number, paymentMethod: string, fulfillmentType: string, fulfillmentDetails?: string, isPriority: boolean = false): Promise<{ orderNumber: string, status: string }> {
    const cartRows = await this.db.query<CartItemRow>(
      `SELECT * FROM cart WHERE user_id = $1`,
      [userId],
    );
    if (cartRows.length === 0) throw new BadRequestException('Cart is empty');

    // Priority checkout validation
    if (isPriority) {
      const activePriorityOrders = await this.getPriorityQueueCount();
      if (activePriorityOrders >= 5) {
        throw new BadRequestException('Priority queue is currently full. Please wait or proceed with normal checkout.');
      }
    }

    // Assume the policy of the first item for the whole order for simplicity right now
    let policy = 'pay_after';
    const store = cartRows[0].product_store;
    if (store) {
       const [v] = await this.db.query<{ policy_delivery: string, policy_pickup: string, policy_table: string, policy_queue: string }>(
         `SELECT policy_delivery, policy_pickup, policy_table, policy_queue FROM users WHERE vendor_store = $1 AND role = 'vendor'`,
         [store]
       );
       if (v) {
         if (fulfillmentType === 'pickup') policy = v.policy_pickup;
         else if (fulfillmentType === 'table') policy = v.policy_table;
         else if (fulfillmentType === 'queue') policy = v.policy_queue;
         else policy = v.policy_delivery;
       }
    }

    let isPayBefore = policy === 'pay_before';
    if (paymentMethod === 'card') isPayBefore = true;
    if (paymentMethod === 'cod') isPayBefore = false;

    const initialStatus = isPayBefore ? 'pending_payment' : 'pending';
    
    // Using one order number for all items in this checkout session
    let finalOrderNumber = '';
    
    // We retry the whole block to ensure order_number uniqueness
    let orderRows: Order[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = isPayBefore ? null : generateOrderNumber();
      try {
        let isFirstItem = true;
        for (const item of cartRows) {
          // Add ₹5.00 priority charge to the first item of the order (so it is only charged once per checkout)
          const itemPrice = (isPriority && isFirstItem) ? Number(item.price) + 5 : Number(item.price);
          isFirstItem = false;

          await this.db.query(
            `INSERT INTO orders (user_id, product_id, product_name, product_image, product_store, price, currency, quantity, status, order_number, fulfillment_type, fulfillment_details, is_priority)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              userId, item.product_id, item.product_name, item.product_image,
              item.product_store ?? null,
              itemPrice, item.currency, item.quantity,
              initialStatus,
              orderNumber,
              fulfillmentType,
              fulfillmentDetails ?? null,
              isPriority
            ],
          );
          
          // Deduct stock per cart item successfully processed if it's a vendor product
          if (item.product_id >= 900000) {
            const actualId = item.product_id - 900000;
            await this.db.query(
              `UPDATE vendor_products 
               SET stock_count = GREATEST(0, stock_count - $1) 
               WHERE id = $2`,
              [item.quantity, actualId]
            );
          }
        }
        finalOrderNumber = orderNumber ?? '';
        break; // success
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        if (pgErr.code === '23505' && attempt < 4) continue; // unique violation → retry
        throw err;
      }
    }

    // Clear cart
    await this.db.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
    return { orderNumber: finalOrderNumber, status: initialStatus };
  }


  /** Advance the order to the next status stage */
  async advanceStatus(userId: number, orderId: number): Promise<Order> {
    const rows = await this.db.query<Order>(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId],
    );
    if (rows.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const current = rows[0].status as OrderStatus;
    const currentIndex = ORDER_STATUSES.indexOf(current);

    if (currentIndex === ORDER_STATUSES.length - 1) {
      throw new BadRequestException('Order is already delivered');
    }

    const nextStatus = ORDER_STATUSES[currentIndex + 1];

    const updated = await this.db.query<Order>(
      `UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [nextStatus, orderId, userId],
    );
    return updated[0];
  }

  /** Generates a Razorpay Order for a deferred payment order */
  async createRazorpayOrder(userId: number, orderId: number): Promise<{ id: string; amount: number; currency: string }> {
    const rows = await this.db.query<Order>(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );
    if (rows.length === 0) throw new NotFoundException('Order not found');
    
    const order = rows[0];
    if (order.status !== 'pending_payment') {
      throw new BadRequestException('Order is already paid or in progress');
    }

    const amountInPaise = Math.round(Number(order.price) * 100);

    if (isMockKey) {
      return { id: `order_mock_${Date.now()}`, amount: amountInPaise, currency: 'USD' };
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'USD',
      receipt: `receipt_order_${orderId}`,
    });

    return { 
      id: razorpayOrder.id, 
      amount: razorpayOrder.amount, 
      currency: razorpayOrder.currency 
    };
  }

  /** Generates a Razorpay Order for an entire Cart Checkout session */
  async createCartRazorpayOrder(userId: number, fulfillmentType: string, isPriority: boolean): Promise<{ id: string; amount: number; currency: string }> {
    const cartRows = await this.db.query<CartItemRow>(
      `SELECT * FROM cart WHERE user_id = $1`,
      [userId],
    );
    if (cartRows.length === 0) throw new BadRequestException('Cart is empty');

    const subtotal = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping = fulfillmentType === 'delivery' ? (subtotal > 300 ? 0 : cartRows.length > 0 ? 14.99 : 0) : 0;
    const tax = subtotal * 0.08;
    const priorityFee = isPriority ? 5 : 0;
    
    // Total in dollars
    const total = subtotal + shipping + tax + priorityFee;
    
    // Amount in paise (1 INR = 100 paise; Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(total * 100);

    if (isMockKey) {
      return { id: `order_mock_${Date.now()}`, amount: amountInPaise, currency: 'INR' };
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_cart_${userId}_${Date.now()}`,
    });

    return { 
      id: razorpayOrder.id, 
      amount: razorpayOrder.amount, 
      currency: razorpayOrder.currency 
    };
  }

  /** Verifies a cart razorpay payment and then checks out the cart */
  async verifyCartRazorpayPayment(
    userId: number,
    fulfillmentType: string,
    fulfillmentDetails: string | undefined,
    isPriority: boolean,
    razorpayPaymentId: string, 
    razorpayOrderId: string, 
    razorpaySignature: string
  ): Promise<{ orderNumber: string, status: string }> {
    
    // 1. Verify payment signature
    if (!isMockKey) {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        throw new BadRequestException('Razorpay payment details are required');
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestException('Razorpay signature verification failed');
      }
    }
    
    // 2. We now know the card was legitimately processed successfully. Run normal checkout as 'card'.
    return this.checkoutCart(userId, 'card', fulfillmentType, fulfillmentDetails, isPriority);
  }

  /** Simulate paying for an order that is pending_payment. Generates order number now. */
  async payForOrder(userId: number, orderId: number, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string): Promise<Order> {
    const rows = await this.db.query<Order>(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId],
    );
    if (rows.length === 0) throw new NotFoundException('Order not found');
    if (rows[0].status !== 'pending_payment') {
      throw new BadRequestException('Order is already paid or in progress');
    }

    if (!isMockKey) {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        throw new BadRequestException('Razorpay payment details are required');
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestException('Razorpay signature verification failed');
      }
    }

    let updated: Order[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        updated = await this.db.query<Order>(
          `UPDATE orders SET status = 'pending', order_number = $1 WHERE id = $2 RETURNING *`,
          [orderNumber, orderId],
        );
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        if (pgErr.code === '23505' && attempt < 4) continue;
        throw err;
      }
    }
    return updated[0];
  }
}
