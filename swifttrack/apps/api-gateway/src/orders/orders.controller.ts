import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderResponseDto,
  OrderStatus,
  UserType,
} from '@swifttrack/shared';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: any
  ): Promise<OrderResponseDto> {
    console.log(`🚀 [ORDERS-CONTROLLER] POST /api/v1/orders - Creating new order`);
    console.log(`👤 [ORDERS-CONTROLLER] User ID: ${user.userId} | Email: ${user.email}`);
    console.log(`📦 [ORDERS-CONTROLLER] Order data:`, JSON.stringify(createOrderDto, null, 2));
    
    const result = await this.ordersService.createOrder(createOrderDto, user.userId);
    console.log(`✅ [ORDERS-CONTROLLER] Order created successfully`);
    return result;
  }

  @Get()
  @Roles(UserType.CLIENT, UserType.ADMIN, UserType.DRIVER)
  @ApiOperation({ summary: 'Get orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(
    @User() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: OrderStatus
  ) {
    return this.ordersService.getOrders(user.userId, user.userType, {
      page,
      limit,
      status,
    });
  }

  @Get(':id')
  @Roles(UserType.CLIENT, UserType.ADMIN, UserType.DRIVER)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Param('id') id: string,
    @User() user: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(id, user.userId, user.userType);
  }

  @Put(':id')
  @Roles(UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrder(id, updateOrderDto, user.userId, user.userType);
  }

  @Delete(':id')
  @Roles(UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(
    @Param('id') id: string,
    @User() user: any
  ) {
    return this.ordersService.cancelOrder(id, user.userId, user.userType);
  }

  @Post(':id/assign-driver')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Assign driver to order' })
  @ApiResponse({ status: 200, description: 'Driver assigned successfully' })
  @ApiResponse({ status: 404, description: 'Order or driver not found' })
  async assignDriver(
    @Param('id') orderId: string,
    @Body('driverId') driverId: string
  ) {
    return this.ordersService.assignDriver(orderId, driverId);
  }

  @Put(':id/status')
  @Roles(UserType.ADMIN, UserType.DRIVER)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus,
    @User() user: any
  ) {
    return this.ordersService.updateOrderStatus(orderId, status, user.userId, user.userType);
  }

  @Get(':id/tracking')
  @Roles(UserType.CLIENT, UserType.ADMIN, UserType.DRIVER)
  @ApiOperation({ summary: 'Get order tracking information' })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderTracking(
    @Param('id') orderId: string,
    @User() user: any
  ) {
    return this.ordersService.getOrderTracking(orderId, user.userId, user.userType);
  }

  @Post(':id/rating')
  @Roles(UserType.CLIENT)
  @ApiOperation({ summary: 'Rate completed order' })
  @ApiResponse({ status: 200, description: 'Order rated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order not completed' })
  async rateOrder(
    @Param('id') orderId: string,
    @Body() ratingData: { rating: number; feedback?: string },
    @User() user: any
  ) {
    return this.ordersService.rateOrder(orderId, ratingData.rating, ratingData.feedback, user.userId);
  }
}
