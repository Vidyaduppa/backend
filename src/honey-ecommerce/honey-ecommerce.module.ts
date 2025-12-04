import { Module } from '@nestjs/common';
import { HoneyEcommerceService } from './honey-ecommerce.service';
import { HoneyEcommerceController } from './honey-ecommerce.controller';

@Module({
  controllers: [HoneyEcommerceController],
  providers: [HoneyEcommerceService],
})
export class HoneyEcommerceModule {}
