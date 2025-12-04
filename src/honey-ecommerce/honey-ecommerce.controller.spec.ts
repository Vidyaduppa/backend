import { Test, TestingModule } from '@nestjs/testing';
import { HoneyEcommerceController } from './honey-ecommerce.controller';
import { HoneyEcommerceService } from './honey-ecommerce.service';

describe('HoneyEcommerceController', () => {
  let controller: HoneyEcommerceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoneyEcommerceController],
      providers: [HoneyEcommerceService],
    }).compile();

    controller = module.get<HoneyEcommerceController>(HoneyEcommerceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
