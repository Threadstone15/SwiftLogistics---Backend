import { OrderStatus } from '../utils/enums';

export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  orderDetails: {
    orderSize: string;
    orderWeight: string;
    orderType: string;
    priority: boolean;
    amount: number;
    address: string;
  };
  timestamp: Date;
}

export interface OrderStatusUpdatedEvent {
  orderId: number;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedBy: {
    id: number;
    type: 'user' | 'driver' | 'system';
  };
  reason?: string;
  timestamp: Date;
}

export interface OrderAssignedEvent {
  orderId: number;
  driverId: number;
  assignedAt: Date;
}

export interface OrderDeliveredEvent {
  orderId: number;
  driverId: number;
  deliveredAt: Date;
  proofOfDeliveryUrl?: string;
}

export interface OrderFailedEvent {
  orderId: number;
  driverId?: number;
  reason: string;
  failedAt: Date;
}
