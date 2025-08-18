import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Tracking')
@Controller('tracking')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Track order by ID' })
  @ApiResponse({ status: 200, description: 'Tracking info retrieved successfully' })
  async trackOrder(@Param('orderId') orderId: string) {
    return this.trackingService.trackOrder(orderId);
  }
}
