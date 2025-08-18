export interface CmsClient {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CmsOrder {
  orderId: string;
  clientId: string;
  orderDetails: any;
  status: string;
  createdAt: Date;
}

export interface RosOptimizationRequest {
  driverId: string;
  startLocation: { lng: number; lat: number };
  destinations: Array<{
    orderId: string;
    lng: number;
    lat: number;
    priority: number;
    timeWindow?: { start: Date; end: Date };
  }>;
}

export interface RosOptimizationResponse {
  routeId: string;
  optimizedRoute: Array<{
    orderId: string;
    sequence: number;
    estimatedArrival: Date;
    travelTime: number;
    distance: number;
  }>;
  totalDistance: number;
  totalDuration: number;
}

export interface WmsInventoryItem {
  orderId: string;
  location: string;
  section: string;
  rack: string;
  status: 'arrived' | 'picked' | 'departed';
  timestamp: Date;
}
