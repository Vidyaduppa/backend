import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product as ProductEntity, ProductDocument } from './schemas/product.schema';

type ProductCategory = 'all' | 'raw' | 'organic' | 'infused' | 'specialty';
type PriceFilter = 'all' | 'under15' | '15to25' | 'over25';
type SortBy = 'featured' | 'price-low' | 'price-high' | 'name' | 'rating';

export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
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
  imageUrl?: string;
  featured?: boolean;
}

type UpdateProductRequest = Partial<CreateProductRequest>;

@Injectable()
export class HoneyEcommerceService {
  constructor(
    @InjectModel(ProductEntity.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getProducts(query: ProductQuery): Promise<Product[]> {
    const term = (query.q ?? '').trim().toLowerCase();
    const category = (query.category ?? 'all') as ProductCategory;
    const price = (query.price ?? 'all') as PriceFilter;
    const sortBy = (query.sortBy ?? 'featured') as SortBy;

    const filter: Record<string, unknown> = {};
    if (term) {
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }
    if (category !== 'all') {
      filter.category = category;
    }
    if (price === 'under15') filter.price = { $lt: 15 };
    if (price === '15to25') filter.price = { $gte: 15, $lte: 25 };
    if (price === 'over25') filter.price = { $gt: 25 };

    const sort: Record<string, 1 | -1> = {};
    if (sortBy === 'price-low') sort.price = 1;
    if (sortBy === 'price-high') sort.price = -1;
    if (sortBy === 'name') sort.name = 1;
    if (sortBy === 'rating') sort.rating = -1;
    if (sortBy === 'featured') sort.featured = -1;

    const products = await this.productModel.find(filter).sort(sort).lean();
    return products.map((product) => ({
      id: String(product._id),
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category as Exclude<ProductCategory, 'all'>,
      price: product.price,
      rating: product.rating,
      featured: product.featured,
    }));
  }

  async createProduct(payload: unknown): Promise<Product> {
    const body = payload as CreateProductRequest;
    const created = await this.productModel.create({
      name: body.name,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      price: Number(body.price),
      rating: 0,
      featured: Boolean(body.featured),
    });
    return {
      id: String(created._id),
      name: created.name,
      imageUrl: created.imageUrl,
      description: created.description,
      category: created.category as Exclude<ProductCategory, 'all'>,
      price: created.price,
      rating: created.rating,
      featured: created.featured,
    };
  }

  async updateProduct(id: string, payload: unknown): Promise<Product> {
    const body = payload as UpdateProductRequest;
    const updated = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...body,
          ...(body.price === undefined ? {} : { price: Number(body.price) }),
          ...(body.featured === undefined
            ? {}
            : { featured: Boolean(body.featured) }),
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: String(updated._id),
      name: updated.name,
      imageUrl: updated.imageUrl,
      description: updated.description,
      category: updated.category as Exclude<ProductCategory, 'all'>,
      price: updated.price,
      rating: updated.rating,
      featured: updated.featured,
    };
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id);
  }
}
