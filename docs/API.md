# Onelga Local Services API Documentation

## Overview

The Onelga Local Services API provides a RESTful interface for accessing local government services in Onelga. This API powers both the web application and mobile app.

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://api.onelga-services.gov.ng/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123",
  "phoneNumber": "+234-xxx-xxx-xxxx",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St, Onelga"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CITIZEN"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Services

#### GET /services
Get list of available services.

#### POST /identification/apply
Apply for identification letter.

#### POST /birth-certificate/apply
Apply for birth certificate.

#### GET /health-centers
Get list of health centers.

#### POST /health/appointment
Book health appointment.

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 10 requests per hour

## Interactive Documentation

Visit `/api/docs` for interactive Swagger documentation when running the server.

## SDKs and Libraries

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Flutter/Dart
```dart
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: 'http://localhost:5000/api',
  headers: {'Content-Type': 'application/json'},
));

// Add token interceptor
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  },
));
```

## Webhooks

The API supports webhooks for real-time notifications:

- Application status changes
- Appointment reminders
- Document expiry notifications

## Testing

Use the following test accounts:

- **Admin:** admin@onelga.gov.ng / admin123
- **Citizen:** citizen@example.com / citizen123
- **Staff:** staff@onelga.gov.ng / staff123

## Support

For API support, contact: api-support@onelga-services.gov.ng
