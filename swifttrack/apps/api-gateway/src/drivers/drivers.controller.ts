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
import { DriversService } from './drivers.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserType } from '@swifttrack/shared';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiResponse({ status: 200, description: 'Drivers retrieved successfully' })
  async getDrivers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('available') available?: boolean
  ) {
    return this.driversService.getDrivers({ page, limit, available });
  }

  @Get('profile')
  @Roles(UserType.DRIVER)
  @ApiOperation({ summary: 'Get driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile retrieved successfully' })
  async getDriverProfile(@User() user: any) {
    return this.driversService.getDriverProfile(user.userId);
  }

  @Put('profile')
  @Roles(UserType.DRIVER)
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile updated successfully' })
  async updateDriverProfile(
    @User() user: any,
    @Body() updateData: any
  ) {
    return this.driversService.updateDriverProfile(user.userId, updateData);
  }

  @Get('current-orders')
  @Roles(UserType.DRIVER)
  @ApiOperation({ summary: 'Get current driver orders' })
  @ApiResponse({ status: 200, description: 'Current orders retrieved successfully' })
  async getCurrentOrders(@User() user: any) {
    return this.driversService.getCurrentOrders(user.userId);
  }

  @Post('location')
  @Roles(UserType.DRIVER)
  @ApiOperation({ summary: 'Update driver location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(
    @User() user: any,
    @Body() locationData: { lng: number; lat: number }
  ) {
    return this.driversService.updateLocation(user.userId, locationData);
  }

  @Put('availability')
  @Roles(UserType.DRIVER)
  @ApiOperation({ summary: 'Update driver availability' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  async updateAvailability(
    @User() user: any,
    @Body() availabilityData: { available: boolean }
  ) {
    return this.driversService.updateAvailability(user.userId, availabilityData.available);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiResponse({ status: 200, description: 'Driver retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async getDriverById(@Param('id') id: string) {
    return this.driversService.getDriverById(id);
  }

  @Get(':id/performance')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get driver performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getDriverPerformance(@Param('id') id: string) {
    return this.driversService.getDriverPerformance(id);
  }
}
