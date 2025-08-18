import { OrderStatus } from './enums';

export function isValidStatusTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PLACED]: [OrderStatus.AT_WAREHOUSE, OrderStatus.FAILED],
    [OrderStatus.AT_WAREHOUSE]: [OrderStatus.PICKED, OrderStatus.FAILED],
    [OrderStatus.PICKED]: [OrderStatus.IN_TRANSIT, OrderStatus.FAILED],
    [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
    [OrderStatus.DELIVERED]: [OrderStatus.CONFIRMED],
    [OrderStatus.CONFIRMED]: [],
    [OrderStatus.FAILED]: [],
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
}

export function generateTrackingId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ST${timestamp}${random}`.toUpperCase();
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
