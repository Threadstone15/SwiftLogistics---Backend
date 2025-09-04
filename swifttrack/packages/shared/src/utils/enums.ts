export enum UserType {
  CLIENT = 'client',
  ADMIN = 'admin',
  DRIVER = 'driver',
}

export enum OrderSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum OrderWeight {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
}

export enum OrderStatus {
  PLACED = 'placed',
  AT_WAREHOUSE = 'at_warehouse',
  PICKED = 'picked',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum ActorType {
  USER = 'user',
  DRIVER = 'driver',
  SYSTEM = 'system',
}
