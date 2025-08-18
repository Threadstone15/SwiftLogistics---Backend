# SwiftTrack Backend API Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Base URLs & Environment](#base-urls--environment)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [WebSocket Integration](#websocket-integration)
6. [Error Handling](#error-handling)
7. [Frontend Integration Examples](#frontend-integration-examples)
8. [Data Models](#data-models)
9. [Testing & Development](#testing--development)

## Overview

SwiftTrack backend provides a comprehensive REST API with real-time WebSocket capabilities for logistics management. The system uses JWT-based authentication with role-based access control.

### System Architecture
- **API Gateway**: Central entry point (Port 3000)
- **Microservices**: Order, Driver, Warehouse, Tracking, Admin services
- **Real-time**: WebSocket support for live tracking
- **Documentation**: Interactive Swagger docs available

## Base URLs & Environment

### Development Environment
```
API Gateway:     http://localhost:3000
API Base URL:    http://localhost:3000/api/v1
WebSocket URL:   ws://localhost:3000
Documentation:   http://localhost:3000/api/docs
```

### Production Environment
```
API Gateway:     https://api.swifttrack.com
API Base URL:    https://api.swifttrack.com/api/v1
WebSocket URL:   wss://api.swifttrack.com
Documentation:   https://api.swifttrack.com/api/docs
```

## Authentication

### User Types
- **CLIENT**: Regular customers placing orders
- **DRIVER**: Delivery drivers
- **ADMIN**: System administrators

### Authentication Flow

#### 1. Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "userType": "CLIENT"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "userType": "CLIENT"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### 3. Driver Login (Separate endpoint)
```http
POST /api/v1/auth/driver/login
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "Driver123!"
}
```

#### 4. Token Refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5. Using Authentication
Include the access token in all API requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 6. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

### Default Credentials (Development)
```
Admin:  admin@swifttrack.com / Admin123!
Client: client1@example.com / Client123!
Driver: driver1@swifttrack.com / Driver123!
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/driver/login` | Driver login | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| GET | `/api/v1/auth/profile` | Get user profile | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |

### Order Management Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/v1/orders` | Create new order | CLIENT, ADMIN |
| GET | `/api/v1/orders` | Get orders list | ALL |
| GET | `/api/v1/orders/:id` | Get order by ID | ALL |
| PUT | `/api/v1/orders/:id` | Update order | CLIENT, ADMIN |
| DELETE | `/api/v1/orders/:id` | Cancel order | CLIENT, ADMIN |
| POST | `/api/v1/orders/:id/assign-driver` | Assign driver | ADMIN |
| PUT | `/api/v1/orders/:id/status` | Update status | ADMIN, DRIVER |
| GET | `/api/v1/orders/:id/tracking` | Get tracking info | ALL |
| POST | `/api/v1/orders/:id/rating` | Rate order | CLIENT |

#### Create Order Example
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderSize": "MEDIUM",
  "orderWeight": "LIGHT",
  "orderType": "standard_delivery",
  "priority": false,
  "amount": 150.00,
  "address": "123 Main St, Colombo 03",
  "locationOrigin": "79.8612,6.9271",
  "locationDestination": "79.8712,6.9371",
  "specialInstructions": "Handle with care"
}
```

### Driver Management Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/v1/drivers` | Get all drivers | ADMIN |
| GET | `/api/v1/drivers/profile` | Get driver profile | DRIVER |
| PUT | `/api/v1/drivers/profile` | Update driver profile | DRIVER |
| GET | `/api/v1/drivers/current-orders` | Get current orders | DRIVER |
| POST | `/api/v1/drivers/location` | Update location | DRIVER |
| PUT | `/api/v1/drivers/availability` | Update availability | DRIVER |
| GET | `/api/v1/drivers/:id` | Get driver by ID | ADMIN |
| GET | `/api/v1/drivers/:id/performance` | Get performance metrics | ADMIN |

#### Update Driver Location Example
```http
POST /api/v1/drivers/location
Authorization: Bearer <driver-token>
Content-Type: application/json

{
  "lng": 79.8612,
  "lat": 6.9271
}
```

### Warehouse Management Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/v1/warehouse/inventory` | Get inventory | ADMIN |
| GET | `/api/v1/warehouse/locations` | Get warehouse locations | ADMIN |
| GET | `/api/v1/warehouse/:location/orders` | Get warehouse orders | ADMIN |
| POST | `/api/v1/warehouse/:location/process-order` | Process order | ADMIN |
| GET | `/api/v1/warehouse/analytics` | Get analytics | ADMIN |
| PUT | `/api/v1/warehouse/:location/capacity` | Update capacity | ADMIN |

### Tracking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tracking/:orderId` | Track order | Yes |

#### Track Order Example
```http
GET /api/v1/tracking/ORD-123456
Authorization: Bearer <token>
```

**Response:**
```json
{
  "orderId": "ORD-123456",
  "status": "IN_TRANSIT",
  "currentLocation": {
    "lng": 79.8612,
    "lat": 6.9271
  },
  "estimatedDelivery": "2025-08-18T15:30:00Z",
  "history": [
    {
      "status": "PLACED",
      "timestamp": "2025-08-18T10:00:00Z",
      "location": "Warehouse A"
    },
    {
      "status": "PICKED",
      "timestamp": "2025-08-18T11:30:00Z",
      "location": "Warehouse A"
    }
  ]
}
```

### Admin Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/v1/admin/dashboard` | Get dashboard data | ADMIN |
| GET | `/api/v1/admin/system-health` | Get system health | ADMIN |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | No |

## WebSocket Integration

### Connection
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client to Server Events

##### Join Order Tracking
```javascript
socket.emit('join-tracking', {
  orderId: 'ORD-123456'
});
```

##### Leave Order Tracking
```javascript
socket.emit('leave-tracking', {
  orderId: 'ORD-123456'
});
```

#### Server to Client Events

##### Location Updates
```javascript
socket.on('location-update', (data) => {
  console.log('Location update:', data);
  // {
  //   orderId: 'ORD-123456',
  //   location: { lng: 79.8612, lat: 6.9271 },
  //   timestamp: '2025-08-18T12:00:00Z'
  // }
});
```

##### Status Updates
```javascript
socket.on('status-update', (data) => {
  console.log('Status update:', data);
  // {
  //   orderId: 'ORD-123456',
  //   status: 'DELIVERED',
  //   timestamp: '2025-08-18T12:00:00Z'
  // }
});
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Common Error Scenarios

#### 1. Invalid Token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### 2. Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### 3. Rate Limiting
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "ThrottlerException"
}
```

## Frontend Integration Examples

### React/JavaScript Integration

#### 1. API Client Setup
```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

class SwiftTrackAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.data.accessToken);
              // Retry original request
              return this.client.request(error.config);
            } catch (refreshError) {
              this.logout();
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    this.saveTokens(response.data.tokens);
    return response.data;
  }

  async register(email, password, userType) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      userType
    });
    this.saveTokens(response.data.tokens);
    return response.data;
  }

  async refreshToken(refreshToken) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // Order methods
  async createOrder(orderData) {
    const response = await this.client.post('/orders', orderData);
    return response.data;
  }

  async getOrders(params = {}) {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(orderId) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  async trackOrder(orderId) {
    const response = await this.client.get(`/tracking/${orderId}`);
    return response.data;
  }

  // Driver methods
  async updateDriverLocation(lng, lat) {
    const response = await this.client.post('/drivers/location', { lng, lat });
    return response.data;
  }

  async getCurrentOrders() {
    const response = await this.client.get('/drivers/current-orders');
    return response.data;
  }

  // Utility methods
  saveTokens(tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new SwiftTrackAPI();
```

#### 2. React Hook for Orders
```javascript
// hooks/useOrders.js
import { useState, useEffect } from 'react';
import api from '../api/client';

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getOrders(filters);
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  const createOrder = async (orderData) => {
    try {
      const newOrder = await api.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create order');
    }
  };

  return { orders, loading, error, createOrder };
};
```

#### 3. Real-time Tracking Component
```javascript
// components/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const OrderTracking = ({ orderId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('ws://localhost:3000', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    setSocket(newSocket);

    // Join tracking for this order
    newSocket.emit('join-tracking', { orderId });

    // Listen for location updates
    newSocket.on('location-update', (data) => {
      if (data.orderId === orderId) {
        setTrackingData(prev => ({
          ...prev,
          currentLocation: data.location,
          lastUpdated: data.timestamp
        }));
      }
    });

    // Listen for status updates
    newSocket.on('status-update', (data) => {
      if (data.orderId === orderId) {
        setTrackingData(prev => ({
          ...prev,
          status: data.status,
          lastUpdated: data.timestamp
        }));
      }
    });

    // Fetch initial tracking data
    const fetchTrackingData = async () => {
      try {
        const data = await api.trackOrder(orderId);
        setTrackingData(data);
      } catch (error) {
        console.error('Failed to fetch tracking data:', error);
      }
    };

    fetchTrackingData();

    // Cleanup
    return () => {
      newSocket.emit('leave-tracking', { orderId });
      newSocket.close();
    };
  }, [orderId]);

  if (!trackingData) return <div>Loading tracking data...</div>;

  return (
    <div className="order-tracking">
      <h3>Order Tracking: {orderId}</h3>
      <div className="status">
        <strong>Status:</strong> {trackingData.status}
      </div>
      {trackingData.currentLocation && (
        <div className="location">
          <strong>Current Location:</strong>
          <p>Lat: {trackingData.currentLocation.lat}</p>
          <p>Lng: {trackingData.currentLocation.lng}</p>
        </div>
      )}
      <div className="eta">
        <strong>Estimated Delivery:</strong> {trackingData.estimatedDelivery}
      </div>
      <div className="last-updated">
        <em>Last updated: {trackingData.lastUpdated}</em>
      </div>
    </div>
  );
};

export default OrderTracking;
```

#### 4. Driver Location Tracker
```javascript
// components/DriverLocationTracker.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/client';

const DriverLocationTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    let watchId;

    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            await api.updateDriverLocation(longitude, latitude);
            setLastLocation({ lat: latitude, lng: longitude });
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);

  return (
    <div className="driver-location-tracker">
      <button 
        onClick={() => setIsTracking(!isTracking)}
        className={isTracking ? 'stop-tracking' : 'start-tracking'}
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      
      {lastLocation && (
        <div className="last-location">
          <p>Last updated location:</p>
          <p>Lat: {lastLocation.lat}</p>
          <p>Lng: {lastLocation.lng}</p>
        </div>
      )}
    </div>
  );
};

export default DriverLocationTracker;
```

### Vue.js Integration

#### 1. Composable for API calls
```javascript
// composables/useSwiftTrackAPI.js
import { ref, reactive } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export function useSwiftTrackAPI() {
  const loading = ref(false);
  const error = ref(null);

  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Add auth header
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await client.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOrders = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await client.get('/orders', { params });
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch orders';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    login,
    getOrders,
    // ... other methods
  };
}
```

### Angular Integration

#### 1. Service for API calls
```typescript
// services/swift-track-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface AuthResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SwiftTrackApiService {
  private readonly baseUrl = 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<any>(null);
  
  constructor(private http: HttpClient) {}

  // Authentication
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.tokens.accessToken);
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  // Orders
  getOrders(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get(`${this.baseUrl}/orders`, { params: httpParams });
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  trackOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tracking/${orderId}`);
  }

  // Utility methods
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
```

## Data Models

### Order Model
```typescript
interface Order {
  orderId: string;
  userId: string;
  orderSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  orderWeight: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  orderType: string;
  priority: boolean;
  amount: number;
  address: string;
  locationOriginLng: number;
  locationOriginLat: number;
  locationDestinationLng: number;
  locationDestinationLat: number;
  specialInstructions?: string;
  status: OrderStatus;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

enum OrderStatus {
  PLACED = 'PLACED',
  AT_WAREHOUSE = 'AT_WAREHOUSE',
  PICKED = 'PICKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  userType: 'CLIENT' | 'DRIVER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}
```

### Driver Model
```typescript
interface Driver {
  id: string;
  email: string;
  nic: string;
  vehicleReg: string;
  mobile: string;
  address: string;
  available: boolean;
  currentLocation?: {
    lng: number;
    lat: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Tracking Data Model
```typescript
interface TrackingData {
  orderId: string;
  status: OrderStatus;
  currentLocation: {
    lng: number;
    lat: number;
  };
  estimatedDelivery: string;
  history: TrackingEvent[];
}

interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  location?: string;
  description?: string;
}
```

## Testing & Development

### API Testing with Postman

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "SwiftTrack API",
    "description": "SwiftTrack Logistics API Collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}"
      }
    ]
  }
}
```

### cURL Examples

#### Login and get token
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swifttrack.com","password":"Admin123!"}'

# Extract token from response and use in subsequent requests
TOKEN="your-access-token-here"

# Get orders
curl -X GET http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN"

# Create order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderSize": "MEDIUM",
    "orderWeight": "LIGHT",
    "orderType": "standard_delivery",
    "priority": false,
    "amount": 150.00,
    "address": "123 Main St, Colombo 03",
    "locationOrigin": "79.8612,6.9271",
    "locationDestination": "79.8712,6.9371"
  }'
```

### Rate Limiting
- **Default Limit**: 100 requests per minute per IP
- **Headers**: Check `X-RateLimit-*` headers in responses
- **Response**: HTTP 429 when limit exceeded

### CORS Configuration
```javascript
// Default CORS settings
{
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Development Setup for Frontend

### 1. Start Backend Services
```bash
# Clone and setup backend
git clone <repository-url>
cd swifttrack

# Start development environment
scripts/dev-setup.bat  # Windows
# or
bash scripts/dev-setup.sh  # Linux/Mac

# Start services
pnpm run dev
```

### 2. Environment Variables for Frontend
```javascript
// .env.local (React/Next.js)
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
REACT_APP_WS_URL=ws://localhost:3000

// .env (Vue.js)
VUE_APP_API_BASE_URL=http://localhost:3000/api/v1
VUE_APP_WS_URL=ws://localhost:3000

// environment.ts (Angular)
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'ws://localhost:3000'
};
```

### 3. Proxy Configuration (for development CORS)

#### React (package.json)
```json
{
  "name": "swifttrack-frontend",
  "proxy": "http://localhost:3000"
}
```

#### Vue.js (vue.config.js)
```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
```

#### Angular (proxy.conf.json)
```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Support & Resources

- **API Documentation**: http://localhost:3000/api/docs
- **Backend Repository**: [SwiftLogistics---Backend](repository-url)
- **System Health**: http://localhost:3000/health
- **Monitoring**: http://localhost:3333 (Grafana)

## Security Notes

1. **Never expose JWT secrets** in frontend code
2. **Use HTTPS** in production
3. **Implement token refresh** logic for long-running applications
4. **Validate all inputs** on both frontend and backend
5. **Handle sensitive data** appropriately (no passwords in logs)
6. **Implement proper session management**

---

This guide provides everything needed to integrate with the SwiftTrack backend API. For specific implementation questions or issues, refer to the interactive API documentation at `/api/docs` or check the backend repository for the latest updates.
