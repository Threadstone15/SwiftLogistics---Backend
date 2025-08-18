export interface DriverLocationUpdatedEvent {
  driverId: number;
  location: {
    lng: number;
    lat: number;
  };
  speed?: number;
  heading?: number;
  timestamp: Date;
}

export interface DriverRouteUpdatedEvent {
  driverId: number;
  routeId: string;
  waypoints: Array<{
    orderId: number;
    lng: number;
    lat: number;
    sequence: number;
    estimatedArrival: Date;
  }>;
  totalDistance: number;
  totalDuration: number;
  updatedAt: Date;
}

export interface DriverManifestUpdatedEvent {
  driverId: number;
  date: Date;
  orders: Array<{
    orderId: number;
    orderType: string;
    address: string;
    priority: boolean;
  }>;
  updatedAt: Date;
}
