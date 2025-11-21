# Retech Inventory API Endpoints Reference

## Base URL
```
http://localhost:3001/api
```

---

## Authentication Routes
**Base:** `/auth`

### User Registration
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}

Response: {
  "success": true,
  "message": "User created successfully. Please check your email for confirmation.",
  "data": {
    "user": { /* user object */ },
    "session": { /* session object */ }
  }
}
```

### User Login
```
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response: {
  "success": true,
  "data": {
    "user": { /* user object */ },
    "session": { /* session object */ }
  }
}
```

### User Logout
```
POST /auth/signout

Response: {
  "success": true,
  "message": "Signed out successfully"
}
```

### Get Current User Profile
```
GET /auth/profile
Authorization: Bearer <access_token>

Response: {
  "success": true,
  "data": {
    "user": { /* user object */ },
    "profile": { /* profile object */ }
  }
}
```

### Enable 2FA
```
POST /auth/2fa/enable
Authorization: Bearer <access_token>

Response: {
  "success": true,
  "data": {
    "qr_code": "...",
    "secret": "...",
    "uri": "..."
  }
}
```

### Verify 2FA Code
```
POST /auth/2fa/verify
Content-Type: application/json

{
  "code": "123456",
  "factor_id": "factor_id_here"
}

Response: {
  "success": true,
  "message": "2FA verified successfully"
}
```

### Password Reset Request
```
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: {
  "success": true,
  "message": "Password reset email sent"
}
```

---

## Device Management Routes
**Base:** `/devices`

### List Devices
```
GET /devices

Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "imei": "123456789012345",
      "serialNumber": "SN123456",
      "status": "IN_STOCK",
      "condition": "Like New",
      ...
    }
  ]
}
```

### Get Device by ID
```
GET /devices/:id

Response: {
  "success": true,
  "data": { /* device object */ }
}
```

### Create Device
```
POST /devices
Content-Type: application/json

{
  "productVariantId": "uuid",
  "imei": "123456789012345",
  "serialNumber": "SN123456",
  "condition": "Like New",
  "purchasePrice": 450.00,
  "purchaseDate": "2025-11-15"
}

Response: {
  "success": true,
  "data": { /* created device */ }
}
```

### Update Device
```
PATCH /devices/:id
Content-Type: application/json

{
  "condition": "Good",
  "purchasePrice": 400.00
}

Response: {
  "success": true,
  "data": { /* updated device */ }
}
```

### Delete Device
```
DELETE /devices/:id

Response: {
  "success": true,
  "message": "Device deleted"
}
```

---

## SICKW API Routes
**Base:** `/sickw`

### Get Device Pricing
```
GET /sickw/pricing?imei=123&model=iPhone15&condition=new

Query Parameters:
  - imei: Device IMEI (optional if model provided)
  - model: Device model (optional if imei provided)
  - condition: Device condition (optional)

Response: {
  "success": true,
  "data": {
    "pricing": { /* pricing data */ },
    "market_value": 850.00,
    ...
  },
  "meta": {
    "cached": true,
    "age_seconds": 1234
  }
}
```

### Get Device Information
```
GET /sickw/device/:imei

Path Parameters:
  - imei: Device IMEI (required)

Response: {
  "success": true,
  "data": {
    "imei": "123456789012345",
    "brand": "Apple",
    "model": "iPhone 15 Pro",
    "specs": { /* device specs */ },
    ...
  },
  "meta": {
    "cached": false,
    "age_seconds": 0
  }
}
```

### Clear Cache
```
DELETE /sickw/cache?cache_key=sickw:pricing:123:new

Query Parameters:
  - cache_key: Specific cache key to delete (optional)
  - If not provided, clears all expired cache entries

Response: {
  "success": true,
  "message": "Cache cleared for sickw:pricing:123:new"
}
```

### Get Cache Statistics
```
GET /sickw/cache/stats

Response: {
  "success": true,
  "data": {
    "total": 42,
    "expired": 5,
    "active": 37,
    "by_endpoint": {
      "pricing": 28,
      "device": 14
    }
  }
}
```

---

## Health Check Routes
**Base:** `/`

### Health Status
```
GET /health

Response: {
  "success": true,
  "message": "Retech Inventory Backend is running",
  "timestamp": "2025-11-20T12:00:00.000Z",
  "environment": "development"
}
```

### API Information
```
GET /

Response: {
  "success": true,
  "message": "Retech Inventory Management System API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "devices": "/api/devices",
    "sickw": "/api/sickw",
    "documentation": "/api/docs"
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Authentication

Most endpoints require JWT token authentication:

```
Authorization: Bearer <access_token>
```

Obtain tokens by logging in via `/auth/signin`.

Tokens expire after 15 minutes. Use refresh token to get a new access token.

---

## CORS Configuration

The API allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Desktop app)

Add more origins by updating `.env`:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

---

## Rate Limiting

Authentication endpoints: 5 requests/minute per IP
General API endpoints: 100 requests/minute per user

---

## Environment Variables

```
PORT=3001
NODE_ENV=development
SICKW_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

**Last Updated:** 2025-11-20
