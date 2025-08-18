export interface DriverLocation {
  driverId: number;
  lng: number;
  lat: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

export interface DriverManifest {
  driverId: number;
  date: Date;
  orders: ManifestOrder[];
  route?: RouteInfo;
}

export interface ManifestOrder {
  orderId: number;
  orderType: string;
  address: string;
  priority: boolean;
  estimatedTime?: Date;
  status: string;
}

export interface RouteInfo {
  waypoints: RouteWaypoint[];
  totalDistance: number;
  totalDuration: number;
  optimized: boolean;
  generatedAt: Date;
}

export interface RouteWaypoint {
  orderId: number;
  lng: number;
  lat: number;
  address: string;
  sequence: number;
  estimatedArrival: Date;
}
