import { Test, TestingModule } from '@nestjs/testing';
import { HoneyEcommerceService } from './honey-ecommerce.service';

describe('HoneyEcommerceService', () => {
  let service: HoneyEcommerceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoneyEcommerceService],
    }).compile();

    service = module.get<HoneyEcommerceService>(HoneyEcommerceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
