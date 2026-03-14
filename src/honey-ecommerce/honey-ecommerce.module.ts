import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoneyEcommerceService } from './honey-ecommerce.service';
import { HoneyEcommerceController } from './honey-ecommerce.controller';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [HoneyEcommerceController],
  providers: [HoneyEcommerceService],
})
export class HoneyEcommerceModule {}
