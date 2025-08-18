const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

// Mock data
let orders = new Map();
let drivers = new Map();

// Initialize mock data
drivers.set('driver-1', {
  id: 'driver-1',
  name: 'John Driver',
  status: 'AVAILABLE',
  location: { lat: 6.9271, lng: 79.8612 },
  vehicle: { type: 'VAN', capacity: 1000 }
});

// ROS API Routes
app.get('/ros/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ROS Mock', 
    timestamp: new Date().toISOString() 
  });
});

// Route optimization endpoint
app.post('/ros/optimize-route', (req, res) => {
  const { orderId, pickupLocation, deliveryLocation, driverId } = req.body;
  
  console.log('ROS Route Optimization Request:', req.body);
  
  // Mock route optimization
  const optimizedRoute = {
    orderId,
    driverId,
    route: {
      distance: Math.floor(Math.random() * 50) + 10, // 10-60 km
      estimatedTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
      waypoints: [
        pickupLocation,
        {
          lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
          lng: (pickupLocation.lng + deliveryLocation.lng) / 2,
          description: 'Intermediate waypoint'
        },
        deliveryLocation
      ],
      trafficConditions: 'MODERATE',
      fuelConsumption: Math.floor(Math.random() * 10) + 5 // 5-15 liters
    },
    alternatives: [
      {
        name: 'Fastest Route',
        distance: Math.floor(Math.random() * 45) + 15,
        estimatedTime: Math.floor(Math.random() * 100) + 40
      },
      {
        name: 'Shortest Route',
        distance: Math.floor(Math.random() * 40) + 12,
        estimatedTime: Math.floor(Math.random() * 130) + 50
      }
    ],
    optimizedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: optimizedRoute
  });
});

// Get driver location
app.get('/ros/drivers/:driverId/location', (req, res) => {
  const { driverId } = req.params;
  const driver = drivers.get(driverId);
  
  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Driver not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      driverId,
      location: driver.location,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Update driver location
app.put('/ros/drivers/:driverId/location', (req, res) => {
  const { driverId } = req.params;
  const { lat, lng } = req.body;
  
  const driver = drivers.get(driverId);
  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Driver not found'
    });
  }
  
  driver.location = { lat, lng };
  drivers.set(driverId, driver);
  
  console.log(`Driver ${driverId} location updated:`, { lat, lng });
  
  res.json({
    success: true,
    data: {
      driverId,
      location: driver.location,
      updatedAt: new Date().toISOString()
    }
  });
});

// Get route progress
app.get('/ros/orders/:orderId/progress', (req, res) => {
  const { orderId } = req.params;
  
  // Mock progress data
  const progress = {
    orderId,
    status: 'IN_TRANSIT',
    currentLocation: {
      lat: 6.9271 + (Math.random() - 0.5) * 0.01,
      lng: 79.8612 + (Math.random() - 0.5) * 0.01
    },
    progressPercentage: Math.floor(Math.random() * 80) + 10, // 10-90%
    estimatedArrival: new Date(Date.now() + Math.random() * 3600000).toISOString(), // within 1 hour
    distanceRemaining: Math.floor(Math.random() * 30) + 5, // 5-35 km
    nextWaypoint: {
      lat: 6.9371,
      lng: 79.8712,
      description: 'Next delivery point'
    }
  };
  
  res.json({
    success: true,
    data: progress
  });
});

// Calculate ETA
app.post('/ros/calculate-eta', (req, res) => {
  const { currentLocation, destination, trafficConditions = 'NORMAL' } = req.body;
  
  const baseTime = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
  const trafficMultiplier = trafficConditions === 'HEAVY' ? 1.5 : 
                           trafficConditions === 'LIGHT' ? 0.8 : 1.0;
  
  const eta = {
    estimatedTime: Math.floor(baseTime * trafficMultiplier),
    estimatedArrival: new Date(Date.now() + (baseTime * trafficMultiplier * 60000)).toISOString(),
    distance: Math.floor(Math.random() * 25) + 5,
    trafficConditions,
    confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
  };
  
  res.json({
    success: true,
    data: eta
  });
});

// Batch route optimization
app.post('/ros/optimize-batch', (req, res) => {
  const { orders: orderList, constraints } = req.body;
  
  console.log('ROS Batch Optimization Request:', { orderCount: orderList.length, constraints });
  
  // Mock batch optimization
  const optimizedBatch = {
    totalOrders: orderList.length,
    optimizedRoutes: orderList.map((order, index) => ({
      orderId: order.orderId,
      sequence: index + 1,
      estimatedTime: Math.floor(Math.random() * 60) + 30,
      distance: Math.floor(Math.random() * 40) + 10
    })),
    totalDistance: Math.floor(Math.random() * 200) + 100,
    totalTime: Math.floor(Math.random() * 300) + 180,
    fuelSavings: Math.floor(Math.random() * 20) + 5,
    optimizedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: optimizedBatch
  });
});

app.listen(PORT, () => {
  console.log(`🧪 ROS Mock Service running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/ros/health`);
  console.log('📍 Available endpoints:');
  console.log('  POST /ros/optimize-route');
  console.log('  GET  /ros/drivers/:id/location');
  console.log('  PUT  /ros/drivers/:id/location');
  console.log('  GET  /ros/orders/:id/progress');
  console.log('  POST /ros/calculate-eta');
  console.log('  POST /ros/optimize-batch');
});
