import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '@swifttrack/shared';

@ApiTags('Warehouse')
@Controller('warehouse')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('inventory')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get warehouse inventory' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  async getInventory(
    @Query('location') location?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.warehouseService.getInventory({ location, page, limit });
  }

  @Get('locations')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all warehouse locations' })
  @ApiResponse({ status: 200, description: 'Warehouse locations retrieved successfully' })
  async getWarehouseLocations() {
    return this.warehouseService.getWarehouseLocations();
  }

  @Get(':location/orders')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get orders at specific warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse orders retrieved successfully' })
  async getWarehouseOrders(
    @Param('location') location: string,
    @Query('status') status?: string
  ) {
    return this.warehouseService.getWarehouseOrders(location, status);
  }

  @Post(':location/process-order')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Process order at warehouse' })
  @ApiResponse({ status: 200, description: 'Order processed successfully' })
  async processOrder(
    @Param('location') location: string,
    @Body() processData: { orderId: string; action: string }
  ) {
    return this.warehouseService.processOrder(location, processData.orderId, processData.action);
  }

  @Get('analytics')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get warehouse analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.warehouseService.getAnalytics(startDate, endDate);
  }

  @Put(':location/capacity')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update warehouse capacity' })
  @ApiResponse({ status: 200, description: 'Capacity updated successfully' })
  async updateCapacity(
    @Param('location') location: string,
    @Body() capacityData: { maxCapacity: number }
  ) {
    return this.warehouseService.updateCapacity(location, capacityData.maxCapacity);
  }
}
