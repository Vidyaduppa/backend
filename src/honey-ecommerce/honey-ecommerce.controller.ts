import { Controller } from '@nestjs/common';
import { HoneyEcommerceService } from './honey-ecommerce.service';

@Controller('honey-ecommerce')
export class HoneyEcommerceController {
  constructor(private readonly honeyEcommerceService: HoneyEcommerceService) {}
}
