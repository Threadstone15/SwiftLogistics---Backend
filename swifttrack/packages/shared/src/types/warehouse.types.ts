export interface Warehouse {
  orderId: number;
  sectionNo?: string;
  rackNo?: string;
  timestampArrived?: Date;
  timestampDeparted?: Date;
}

export interface WarehouseDetails {
  warehouseId: number;
  location: string;
  noOfItems: number;
  orderIds: number[];
  updatedAt: Date;
}
