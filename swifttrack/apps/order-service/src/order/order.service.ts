import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  findAll() {
    return 'This action returns all orders';
  }

  findOne(id: string) {
    return `This action returns order #${id}`;
  }

  create(createOrderDto: any) {
    return 'This action adds a new order';
  }

  update(id: string, updateOrderDto: any) {
    return `This action updates order #${id}`;
  }

  remove(id: string) {
    return `This action removes order #${id}`;
  }
}
