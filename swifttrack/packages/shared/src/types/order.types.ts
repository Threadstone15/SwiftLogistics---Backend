import { OrderSize, OrderWeight, OrderStatus } from '../utils/enums';

export interface Order {
  orderId: number;
  userId: number;
  orderSize: OrderSize;
  orderWeight: OrderWeight;
  orderType: string;
  status: OrderStatus;
  failedReason?: string;
  priority: boolean;
  amount: number;
  address: string;
  locationOriginLng?: number;
  locationOriginLat?: number;
  locationDestinationLng?: number;
  locationDestinationLat?: number;
  locations: LocationPoint[];
  specialInstructions?: string;
  proofOfDeliveryUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationPoint {
  lng: number;
  lat: number;
  address?: string;
  timestamp?: Date;
}

export interface OngoingOrder {
  orderId: number;
  driverId: number;
  locationOriginTemp?: any;
  locationDestinationTemp?: any;
  updatedAt: Date;
}

export interface CurrentDriverPlan {
  driverId: number;
  orderIds: number[];
  generatedAt: Date;
}
