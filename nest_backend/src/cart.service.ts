import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;
  vendor_address?: string;
  price: number;
  currency: string;
  quantity: number;
  added_at: string;
}

export interface AddToCartDto {
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;   // vendor store slug — needed so order routes to vendor dashboard
  price: number;
  currency: string;
}

@Injectable()
export class CartService {
  constructor(private readonly db: DatabaseService) {}

  /** Get all cart items for a user */
  getCart(userId: number): Promise<CartItem[]> {
    return this.db.query<CartItem>(
      `SELECT c.*, u.store_address as vendor_address
       FROM cart c
       LEFT JOIN users u ON u.vendor_store = c.product_store
       WHERE c.user_id = $1 
       ORDER BY c.added_at DESC`,
      [userId],
    );
  }

  /** Upsert: insert or increment quantity on duplicate (user_id, product_id) */
  async addToCart(userId: number, dto: AddToCartDto): Promise<CartItem> {
    const rows = await this.db.query<CartItem>(
      `INSERT INTO cart (user_id, product_id, product_name, product_image, product_store, price, currency, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart.quantity + 1, product_store = EXCLUDED.product_store
       RETURNING *`,
      [userId, dto.product_id, dto.product_name, dto.product_image,
       dto.product_store ?? null, dto.price, dto.currency],
    );
    return rows[0];
  }

  /** Remove one product from the cart */
  removeFromCart(userId: number, productId: number): Promise<CartItem[]> {
    return this.db.query<CartItem>(
      `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *`,
      [userId, productId],
    );
  }
}
