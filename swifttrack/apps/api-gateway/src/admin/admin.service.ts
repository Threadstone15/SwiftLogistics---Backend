import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getDashboard() {
    return {
      totalOrders: 0,
      activeDrivers: 0,
      pendingOrders: 0,
      completedOrders: 0,
      revenue: 0,
    };
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
        rabbitmq: 'connected',
      },
    };
  }
}
