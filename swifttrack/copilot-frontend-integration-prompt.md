# SwiftTrack Frontend Integration Prompt for GitHub Copilot

This file contains all the information needed to integrate a frontend application with the SwiftTrack Logistics Backend API. Use this as context for GitHub Copilot to generate complete API integration code.

## Backend API Information

### Base Configuration

- **API Base URL**: `http://localhost:3000/api/v1`
- **WebSocket URL**: `ws://localhost:3000`
- **Authentication**: JWT Bearer tokens
- **Documentation**: http://localhost:3000/api/docs

### Authentication Flow

- Users get access and refresh tokens after login
- Include `Authorization: Bearer <token>` header in all authenticated requests
- Implement token refresh logic for expired tokens
- Support for CLIENT, DRIVER, and ADMIN user types

## Complete API Endpoints Reference

### Authentication Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/driver/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/profile
POST /api/v1/auth/change-password
```

### Order Management Endpoints

```
POST   /api/v1/orders                   # Create new order
GET    /api/v1/orders                   # Get orders list with filters
GET    /api/v1/orders/:id               # Get order by ID
PUT    /api/v1/orders/:id               # Update order
DELETE /api/v1/orders/:id               # Cancel order
POST   /api/v1/orders/:id/assign-driver # Assign driver (ADMIN only)
PUT    /api/v1/orders/:id/status        # Update order status
GET    /api/v1/orders/:id/tracking      # Get tracking information
POST   /api/v1/orders/:id/rating        # Rate completed order
```

### Driver Management Endpoints

```
GET  /api/v1/drivers                    # Get all drivers (ADMIN only)
GET  /api/v1/drivers/profile            # Get driver profile
PUT  /api/v1/drivers/profile            # Update driver profile
GET  /api/v1/drivers/current-orders     # Get current assigned orders
POST /api/v1/drivers/location           # Update driver location
PUT  /api/v1/drivers/availability       # Update availability status
GET  /api/v1/drivers/:id                # Get driver by ID (ADMIN only)
GET  /api/v1/drivers/:id/performance    # Get performance metrics
```

### Warehouse Management Endpoints

```
GET  /api/v1/warehouse/inventory               # Get inventory
GET  /api/v1/warehouse/locations               # Get warehouse locations
GET  /api/v1/warehouse/:location/orders        # Get orders at location
POST /api/v1/warehouse/:location/process-order # Process order
GET  /api/v1/warehouse/analytics               # Get analytics
PUT  /api/v1/warehouse/:location/capacity      # Update capacity
```

### Tracking Endpoints

```
GET /api/v1/tracking/:orderId           # Track order by ID
```

### Admin Endpoints

```
GET /api/v1/admin/dashboard              # Get dashboard data
GET /api/v1/admin/system-health          # Get system health
```

### Health Check

```
GET /health                              # System health check (no auth)
```

## Request/Response Examples

### Login Request

```json
POST /api/v1/auth/login
{
  "email": "client1@example.com",
  "password": "Client123!"
}
```

### Login Response

```json
{
  "user": {
    "id": "uuid",
    "email": "client1@example.com",
    "userType": "CLIENT"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Order Request

```json
POST /api/v1/orders
Authorization: Bearer <token>
{
  "orderSize": "MEDIUM",
  "orderWeight": "LIGHT",
  "orderType": "standard_delivery",
  "priority": false,
  "amount": 150.00,
  "address": "123 Main St, Colombo 03",
  "locationOriginLng": 79.8612,
  "locationOriginLat": 6.9271,
  "locationDestinationLng": 79.8712,
  "locationDestinationLat": 6.9371,
  "specialInstructions": "Handle with care"
}
```

### Get Orders Response

```json
{
  "orders": [
    {
      "orderId": "1",
      "userId": "2",
      "orderSize": "medium",
      "orderWeight": "light",
      "orderType": "standard_delivery",
      "status": "placed",
      "priority": true,
      "amount": "326.00",
      "address": "123 Galle Road, Colombo 03",
      "locationOriginLng": "79.8612",
      "locationOriginLat": "6.9271",
      "locationDestinationLng": "79.8612",
      "locationDestinationLat": "6.9271",
      "specialInstructions": "Handle with care",
      "createdAt": "2025-09-04T03:07:44.857Z",
      "updatedAt": "2025-09-04T03:07:44.857Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

### Update Driver Location Request

```json
POST /api/v1/drivers/location
Authorization: Bearer <driver-token>
{
  "lng": 79.8612,
  "lat": 6.9271
}
```

### Track Order Response

```json
{
  "orderId": "ORD-123456",
  "status": "IN_TRANSIT",
  "currentLocation": {
    "lng": 79.8612,
    "lat": 6.9271
  },
  "estimatedDelivery": "2025-09-04T15:30:00Z",
  "history": [
    {
      "status": "PLACED",
      "timestamp": "2025-09-04T10:00:00Z",
      "location": "Warehouse A"
    },
    {
      "status": "PICKED",
      "timestamp": "2025-09-04T11:30:00Z",
      "location": "Warehouse A"
    }
  ]
}
```

## WebSocket Integration

### Connection Setup

```javascript
const socket = io('ws://localhost:3000', {
  auth: { token: 'your-jwt-token' },
});
```

### Events to Emit

```javascript
// Join order tracking
socket.emit('join-tracking', { orderId: 'ORD-123456' });

// Leave order tracking
socket.emit('leave-tracking', { orderId: 'ORD-123456' });
```

### Events to Listen For

```javascript
// Location updates
socket.on('location-update', data => {
  // { orderId, location: { lng, lat }, timestamp }
});

// Status updates
socket.on('status-update', data => {
  // { orderId, status, timestamp }
});
```

## Data Models

### User Types

```typescript
type UserType = 'CLIENT' | 'DRIVER' | 'ADMIN';
```

### Order Status

```typescript
type OrderStatus =
  | 'placed'
  | 'at_warehouse'
  | 'picked'
  | 'in_transit'
  | 'delivered'
  | 'confirmed'
  | 'failed';
```

### Order Size & Weight

```typescript
type OrderSize = 'small' | 'medium' | 'large';
type OrderWeight = 'light' | 'medium' | 'heavy';
```

### Complete Order Interface

```typescript
interface Order {
  orderId: string;
  userId: string;
  orderSize: OrderSize;
  orderWeight: OrderWeight;
  orderType: string;
  status: OrderStatus;
  priority: boolean;
  amount: string;
  address: string;
  locationOriginLng: string;
  locationOriginLat: string;
  locationDestinationLng: string;
  locationDestinationLat: string;
  specialInstructions?: string;
  proofOfDeliveryUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### User Interface

```typescript
interface User {
  id: string;
  email: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Driver Interface

```typescript
interface Driver {
  driverId: string;
  email: string;
  nic: string;
  vehicleReg: string;
  mobile: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error

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

## Default Test Credentials

```
Admin:  admin@swifttrack.com / Admin123!
Client: client1@example.com / Client123!
Driver: driver1@swifttrack.com / Driver123!
```

## Required API Client Features

When generating the API client code, please include:

1. **Authentication Management**

   - Login/logout functions
   - Token storage (localStorage/sessionStorage)
   - Token refresh logic
   - Auth state management

2. **HTTP Client Setup**

   - Base URL configuration
   - Request/response interceptors
   - Auth header injection
   - Error handling

3. **Order Management**

   - Create, read, update, delete orders
   - Order filtering and pagination
   - Order tracking
   - Status updates

4. **Driver Features** (for driver users)

   - Location updates
   - Current orders
   - Profile management
   - Availability status

5. **Real-time Features**

   - WebSocket connection management
   - Order tracking subscriptions
   - Location updates
   - Status notifications

6. **Admin Features** (for admin users)

   - Dashboard data
   - Driver management
   - Warehouse operations
   - System analytics

7. **Error Handling**

   - Network error recovery
   - Token refresh on 401
   - User-friendly error messages
   - Retry logic

8. **TypeScript Support**
   - Full type definitions
   - Request/response interfaces
   - Enum types
   - Generic API methods

## Framework-Specific Requirements

### React/Next.js

- Custom hooks for API calls (useOrders, useAuth, etc.)
- Context providers for global state
- React Query/SWR integration
- Component-level error boundaries

### Vue.js

- Composables for API functionality
- Pinia store integration
- Vue Router guards for auth
- Error handling middleware

### Angular

- Injectable services
- HTTP interceptors
- Route guards
- RxJS observables for reactive data

### Svelte/SvelteKit

- Stores for state management
- Actions for form handling
- Error pages and components
- SSR considerations

## Rate Limiting

- Default: 100 requests per minute per IP
- Check X-RateLimit-\* headers
- Implement retry logic with exponential backoff

## CORS Configuration

- Allowed origins: localhost:3000, localhost:3001
- Credentials: true
- Methods: GET, POST, PUT, DELETE, OPTIONS

---

Use this information to generate a complete, production-ready API client that handles all SwiftTrack backend endpoints with proper authentication, error handling, and real-time features.
