import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@swifttrack/shared';

@Injectable()
export class TrackingService {
  async trackOrder(orderId: string) {
    return {
      orderId,
      status: OrderStatus.IN_TRANSIT,
      currentLocation: { lng: 79.8612, lat: 6.9271 },
      estimatedDelivery: new Date(),
      history: [],
    };
  }
}
