export interface TrackingUpdateEvent {
  orderId: number;
  driverId: number;
  location: {
    lng: number;
    lat: number;
  };
  timestamp: Date;
  estimatedArrival?: Date;
}

export interface GeofenceEvent {
  orderId: number;
  driverId: number;
  geofenceType: 'warehouse' | 'destination' | 'pickup';
  action: 'entered' | 'exited';
  location: {
    lng: number;
    lat: number;
  };
  timestamp: Date;
}
