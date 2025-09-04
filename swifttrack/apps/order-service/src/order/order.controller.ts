import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll() {
    console.log(`🌐 [ORDER-CONTROLLER] GET /orders - Finding all orders`);
    const result = this.orderService.findAll();
    console.log(`✅ [ORDER-CONTROLLER] GET /orders completed`);
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`🌐 [ORDER-CONTROLLER] GET /orders/${id} - Finding specific order`);
    console.log(`🎯 [ORDER-CONTROLLER] Requested order ID: ${id}`);
    const result = this.orderService.findOne(id);
    console.log(`✅ [ORDER-CONTROLLER] GET /orders/${id} completed`);
    return result;
  }

  @Post()
  create(@Body() createOrderDto: any) {
    console.log(`🌐 [ORDER-CONTROLLER] POST /orders - Creating new order`);
    console.log(`📦 [ORDER-CONTROLLER] Request body:`, JSON.stringify(createOrderDto, null, 2));
    const result = this.orderService.create(createOrderDto);
    console.log(`✅ [ORDER-CONTROLLER] POST /orders completed`);
    return result;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    console.log(`🌐 [ORDER-CONTROLLER] PUT /orders/${id} - Updating order`);
    console.log(`🎯 [ORDER-CONTROLLER] Order ID: ${id}`);
    console.log(`📝 [ORDER-CONTROLLER] Update data:`, JSON.stringify(updateOrderDto, null, 2));
    const result = this.orderService.update(id, updateOrderDto);
    console.log(`✅ [ORDER-CONTROLLER] PUT /orders/${id} completed`);
    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(`🌐 [ORDER-CONTROLLER] DELETE /orders/${id} - Removing order`);
    console.log(`🎯 [ORDER-CONTROLLER] Order ID to delete: ${id}`);
    const result = this.orderService.remove(id);
    console.log(`✅ [ORDER-CONTROLLER] DELETE /orders/${id} completed`);
    return result;
  }
}
