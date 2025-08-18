export const API_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  RATE_LIMIT: {
    TTL: 60,
    LIMIT: 100,
  },
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
} as const;

export const EVENT_PATTERNS = {
  ORDER: {
    CREATED: 'order.created',
    UPDATED: 'order.updated',
    STATUS_CHANGED: 'order.status.changed',
    ASSIGNED: 'order.assigned',
    DELIVERED: 'order.delivered',
    FAILED: 'order.failed',
  },
  DRIVER: {
    LOCATION_UPDATED: 'driver.location.updated',
    ROUTE_UPDATED: 'driver.route.updated',
    MANIFEST_UPDATED: 'driver.manifest.updated',
  },
  TRACKING: {
    UPDATE: 'tracking.update',
    GEOFENCE: 'tracking.geofence',
  },
  INTEGRATION: {
    CMS: {
      CLIENT_CREATED: 'cms.client.created',
      ORDER_CREATED: 'cms.order.created',
      ORDER_UPDATED: 'cms.order.updated',
    },
    ROS: {
      ROUTE_OPTIMIZED: 'ros.route.optimized',
      ROUTE_FAILED: 'ros.route.failed',
    },
    WMS: {
      INVENTORY_ARRIVED: 'wms.inventory.arrived',
      INVENTORY_PICKED: 'wms.inventory.picked',
      INVENTORY_DEPARTED: 'wms.inventory.departed',
    },
  },
} as const;

export const WEBSOCKET_EVENTS = {
  ORDER_STATUS_UPDATED: 'order.status.updated',
  ORDER_LOCATION_UPDATED: 'order.location.updated',
  DRIVER_ROUTE_UPDATED: 'driver.route.updated',
  DRIVER_MANIFEST_UPDATED: 'driver.manifest.updated',
} as const;
