import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { HoneyEcommerceService } from './honey-ecommerce.service';

@Controller('products')
export class HoneyEcommerceController {
  constructor(private readonly honeyEcommerceService: HoneyEcommerceService) {}

  @Get()
  getProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('price') price?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.honeyEcommerceService.getProducts({ q, category, price, sortBy });
  }

  @Post()
  createProduct(@Body() payload: unknown) {
    return this.honeyEcommerceService.createProduct(payload);
  }

  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() payload: unknown) {
    return this.honeyEcommerceService.updateProduct(id, payload);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.honeyEcommerceService.deleteProduct(id);
  }
}
