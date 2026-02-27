import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  currency: string;
  image: string;
  category: string;
  store: string;
  inStock: boolean;
  rating: number;
  stockCount: number;
}

@Injectable()
export class AppService {
  private readonly products: Product[] = [
    {
      id: 1,
      name: 'AeroPods Max',
      description: 'Adaptive noise canceling earbuds with spatial sound.',
      price: 129.99,
      oldPrice: 169.99,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1590658165737-15a047b0d41d?w=900',
      category: 'Audio',
      store: 'pulse-gear',
      inStock: true,
      rating: 4.8,
      stockCount: 48,
    },
    {
      id: 2,
      name: 'Stride Watch S4',
      description: 'GPS fitness watch with recovery score and sleep coach.',
      price: 199.0,
      oldPrice: 239.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
      category: 'Wearables',
      store: 'urban-active',
      inStock: true,
      rating: 4.6,
      stockCount: 30,
    },
    {
      id: 3,
      name: 'ForgeKey 87',
      description: 'Compact RGB keyboard with hot-swappable tactile switches.',
      price: 89.5,
      oldPrice: 109.5,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=900',
      category: 'Accessories',
      store: 'pixel-hub',
      inStock: false,
      rating: 4.4,
      stockCount: 0,
    },
    {
      id: 4,
      name: 'Vision 4K 27',
      description: '4K USB-C monitor with HDR and factory color calibration.',
      price: 329.99,
      oldPrice: 379.99,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1527443224154-c4cebe9f0e0e?w=900',
      category: 'Displays',
      store: 'studio-screen',
      inStock: true,
      rating: 4.7,
      stockCount: 16,
    },
    {
      id: 5,
      name: 'NovaPhone 15',
      description: 'Flagship phone with cinematic camera and AI assist.',
      price: 799.0,
      oldPrice: 899.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900',
      category: 'Phones',
      store: 'mobile-lane',
      inStock: true,
      rating: 4.9,
      stockCount: 22,
    },
    {
      id: 6,
      name: 'CloudLite Laptop 14',
      description: 'Thin ultrabook with all-day battery for creators.',
      price: 1149.0,
      oldPrice: 1299.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900',
      category: 'Computers',
      store: 'pixel-hub',
      inStock: true,
      rating: 4.5,
      stockCount: 12,
    },
    {
      id: 7,
      name: 'SnapCam Mirrorless X',
      description: '24MP mirrorless camera with 4K video and eye AF.',
      price: 649.0,
      oldPrice: 749.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900',
      category: 'Cameras',
      store: 'capture-lab',
      inStock: true,
      rating: 4.3,
      stockCount: 8,
    },
    {
      id: 8,
      name: 'ZenSeat Ergonomic Chair',
      description: 'Mesh ergonomic chair with dynamic lumbar support.',
      price: 249.0,
      oldPrice: 299.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=900',
      category: 'Furniture',
      store: 'home-workflow',
      inStock: true,
      rating: 4.6,
      stockCount: 42,
    },
    {
      id: 9,
      name: 'BeamSound Bar 5.1',
      description: 'Compact 5.1 soundbar with deep wireless subwoofer.',
      price: 219.0,
      oldPrice: 279.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900',
      category: 'Audio',
      store: 'pulse-gear',
      inStock: true,
      rating: 4.4,
      stockCount: 25,
    },
    {
      id: 10,
      name: 'PowerDock 8-in-1',
      description: 'USB-C dock with HDMI, Ethernet, and dual card reader.',
      price: 69.0,
      oldPrice: 89.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900',
      category: 'Accessories',
      store: 'urban-active',
      inStock: true,
      rating: 4.2,
      stockCount: 67,
    },
    {
      id: 11,
      name: 'AirPure Mini',
      description: 'Smart air purifier with app scheduling and quiet mode.',
      price: 139.0,
      oldPrice: 169.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=900',
      category: 'Home',
      store: 'home-workflow',
      inStock: false,
      rating: 4.1,
      stockCount: 0,
    },
    {
      id: 12,
      name: 'TrailGo Backpack',
      description: 'Weather-ready travel backpack with laptop protection.',
      price: 89.0,
      oldPrice: 119.0,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900',
      category: 'Lifestyle',
      store: 'urban-active',
      inStock: true,
      rating: 4.7,
      stockCount: 54,
    },
  ];

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.products.map((product) => product.category)));
  }

  getProductsByStore(storeName: string): Product[] {
    const store = storeName.toLowerCase();
    return this.products.filter((product) => product.store.toLowerCase() === store);
  }
}
