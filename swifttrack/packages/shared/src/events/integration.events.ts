export interface CmsIntegrationEvent {
  type: 'cms.client.created' | 'cms.order.created' | 'cms.order.updated';
  payload: any;
  timestamp: Date;
  correlationId: string;
}

export interface RosIntegrationEvent {
  type: 'ros.route.optimized' | 'ros.route.failed';
  payload: any;
  timestamp: Date;
  correlationId: string;
}

export interface WmsIntegrationEvent {
  type: 'wms.inventory.arrived' | 'wms.inventory.picked' | 'wms.inventory.departed';
  payload: any;
  timestamp: Date;
  correlationId: string;
}
