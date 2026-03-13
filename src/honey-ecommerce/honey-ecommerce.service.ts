import { Injectable, NotFoundException } from '@nestjs/common';

type ProductCategory = 'all' | 'raw' | 'organic' | 'infused' | 'specialty';
type PriceFilter = 'all' | 'under15' | '15to25' | 'over25';
type SortBy = 'featured' | 'price-low' | 'price-high' | 'name' | 'rating';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Exclude<ProductCategory, 'all'>;
  price: number;
  rating: number;
  featured: boolean;
}

interface ProductQuery {
  q?: string;
  category?: string;
  price?: string;
  sortBy?: string;
}

interface CreateProductRequest {
  name: string;
  price: number;
  category: Exclude<ProductCategory, 'all'>;
  description: string;
  featured?: boolean;
}

type UpdateProductRequest = Partial<CreateProductRequest>;

@Injectable()
export class HoneyEcommerceService {
  private products: Product[] = [];

  getProducts(query: ProductQuery): Product[] {
    const term = (query.q ?? '').trim().toLowerCase();
    const category = (query.category ?? 'all') as ProductCategory;
    const price = (query.price ?? 'all') as PriceFilter;
    const sortBy = (query.sortBy ?? 'featured') as SortBy;

    let filtered = this.products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || product.category === category;
      const matchesPrice =
        price === 'all' ||
        (price === 'under15' && product.price < 15) ||
        (price === '15to25' && product.price >= 15 && product.price <= 25) ||
        (price === 'over25' && product.price > 25);

      return matchesTerm && matchesCategory && matchesPrice;
    });

    if (sortBy === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'featured') {
      filtered = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return filtered;
  }

  createProduct(payload: unknown): Product {
    const body = payload as CreateProductRequest;
    const product: Product = {
      id: `p${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      price: Number(body.price),
      rating: 0,
      featured: Boolean(body.featured),
    };
    this.products.unshift(product);
    return product;
  }

  updateProduct(id: string, payload: unknown): Product {
    const body = payload as UpdateProductRequest;
    const index = this.products.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException('Product not found');
    }

    const updated: Product = {
      ...this.products[index],
      ...body,
      price:
        body.price === undefined
          ? this.products[index].price
          : Number(body.price),
      featured:
        body.featured === undefined
          ? this.products[index].featured
          : Boolean(body.featured),
    };

    this.products[index] = updated;
    return updated;
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter((item) => item.id !== id);
  }
}
