const net = require('net');
const express = require('express');

const TCP_PORT = 8082;
const HTTP_PORT = 8083; // For health checks

// Mock warehouse data
let inventory = new Map();
let orders = new Map();

// Initialize mock inventory
inventory.set('ITEM-001', { id: 'ITEM-001', name: 'Package A', quantity: 100, location: 'A1-01' });
inventory.set('ITEM-002', { id: 'ITEM-002', name: 'Package B', quantity: 50, location: 'A1-02' });

// TCP Server for WMS Protocol
const tcpServer = net.createServer((socket) => {
  console.log(`WMS TCP Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
  
  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`WMS TCP Received: ${message}`);
    
    try {
      const request = JSON.parse(message);
      const response = handleWMSRequest(request);
      
      socket.write(JSON.stringify(response) + '\n');
    } catch (error) {
      console.error('WMS TCP Error parsing message:', error);
      socket.write(JSON.stringify({
        success: false,
        error: 'Invalid message format',
        timestamp: new Date().toISOString()
      }) + '\n');
    }
  });
  
  socket.on('end', () => {
    console.log('WMS TCP Client disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('WMS TCP Socket error:', error);
  });
});

function handleWMSRequest(request) {
  const { command, data } = request;
  
  switch (command) {
    case 'INVENTORY_CHECK':
      return handleInventoryCheck(data);
    case 'RESERVE_ITEMS':
      return handleReserveItems(data);
    case 'RELEASE_ITEMS':
      return handleReleaseItems(data);
    case 'UPDATE_LOCATION':
      return handleUpdateLocation(data);
    case 'GET_ORDER_STATUS':
      return handleGetOrderStatus(data);
    case 'PROCESS_SHIPMENT':
      return handleProcessShipment(data);
    default:
      return {
        success: false,
        error: `Unknown command: ${command}`,
        timestamp: new Date().toISOString()
      };
  }
}

function handleInventoryCheck(data) {
  const { itemId } = data;
  const item = inventory.get(itemId);
  
  if (!item) {
    return {
      success: false,
      error: 'Item not found',
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    success: true,
    data: {
      itemId: item.id,
      name: item.name,
      availableQuantity: item.quantity,
      location: item.location,
      reserved: Math.floor(Math.random() * 10), // Mock reserved quantity
      status: item.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
    },
    timestamp: new Date().toISOString()
  };
}

function handleReserveItems(data) {
  const { orderId, items } = data;
  const reservationId = `RES-${Date.now()}`;
  
  // Mock reservation logic
  const reservations = items.map(item => {
    const inventoryItem = inventory.get(item.itemId);
    const canReserve = inventoryItem && inventoryItem.quantity >= item.quantity;
    
    if (canReserve) {
      inventoryItem.quantity -= item.quantity;
      inventory.set(item.itemId, inventoryItem);
    }
    
    return {
      itemId: item.itemId,
      requestedQuantity: item.quantity,
      reservedQuantity: canReserve ? item.quantity : 0,
      status: canReserve ? 'RESERVED' : 'INSUFFICIENT_STOCK'
    };
  });
  
  return {
    success: true,
    data: {
      orderId,
      reservationId,
      reservations,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    },
    timestamp: new Date().toISOString()
  };
}

function handleReleaseItems(data) {
  const { reservationId, orderId } = data;
  
  // Mock release logic
  console.log(`Releasing reservation ${reservationId} for order ${orderId}`);
  
  return {
    success: true,
    data: {
      reservationId,
      orderId,
      status: 'RELEASED'
    },
    timestamp: new Date().toISOString()
  };
}

function handleUpdateLocation(data) {
  const { itemId, newLocation } = data;
  const item = inventory.get(itemId);
  
  if (!item) {
    return {
      success: false,
      error: 'Item not found',
      timestamp: new Date().toISOString()
    };
  }
  
  const oldLocation = item.location;
  item.location = newLocation;
  inventory.set(itemId, item);
  
  return {
    success: true,
    data: {
      itemId,
      oldLocation,
      newLocation,
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

function handleGetOrderStatus(data) {
  const { orderId } = data;
  
  // Mock order status
  const statuses = ['RECEIVED', 'PICKING', 'PACKED', 'SHIPPED'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    success: true,
    data: {
      orderId,
      status: randomStatus,
      location: 'WAREHOUSE_A',
      pickingProgress: Math.floor(Math.random() * 100),
      estimatedShipment: new Date(Date.now() + Math.random() * 86400000).toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

function handleProcessShipment(data) {
  const { orderId, shipmentDetails } = data;
  const trackingNumber = `WMS-${Date.now()}`;
  
  return {
    success: true,
    data: {
      orderId,
      trackingNumber,
      shipmentId: `SHIP-${Date.now()}`,
      status: 'SHIPPED',
      carrier: shipmentDetails.carrier || 'DEFAULT_CARRIER',
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString() // 2 days
    },
    timestamp: new Date().toISOString()
  };
}

// HTTP Server for health checks and monitoring
const app = express();
app.use(express.json());

app.get('/wms/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WMS Mock',
    tcpPort: TCP_PORT,
    httpPort: HTTP_PORT,
    timestamp: new Date().toISOString(),
    connections: tcpServer.connections || 0
  });
});

app.get('/wms/inventory', (req, res) => {
  const inventoryArray = Array.from(inventory.values());
  res.json({
    success: true,
    data: inventoryArray,
    total: inventoryArray.length
  });
});

// Start servers
tcpServer.listen(TCP_PORT, () => {
  console.log(`🧪 WMS Mock TCP Server running on port ${TCP_PORT}`);
});

app.listen(HTTP_PORT, () => {
  console.log(`🧪 WMS Mock HTTP Server running on http://localhost:${HTTP_PORT}`);
  console.log(`🔍 Health check: http://localhost:${HTTP_PORT}/wms/health`);
  console.log(`📦 Inventory: http://localhost:${HTTP_PORT}/wms/inventory`);
  console.log('');
  console.log('TCP Commands supported:');
  console.log('  INVENTORY_CHECK - Check item availability');
  console.log('  RESERVE_ITEMS - Reserve items for order');
  console.log('  RELEASE_ITEMS - Release reserved items');
  console.log('  UPDATE_LOCATION - Update item location');
  console.log('  GET_ORDER_STATUS - Get order processing status');
  console.log('  PROCESS_SHIPMENT - Process shipment');
});
