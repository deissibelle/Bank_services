# Authentication Service

A secure authentication microservice for the banking application built with Node.js, Express, and MongoDB.

## Features

- **User Registration & Login**: Secure user registration and authentication
- **JWT Token Management**: Access and refresh token implementation
- **Password Security**: Bcrypt hashing with salt rounds
- **Account Security**: Account locking after failed login attempts
- **Email Verification**: User email verification system
- **Password Reset**: Secure password reset functionality
- **Role-Based Access Control**: Support for customer, admin, and support roles
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **Health Checks**: Docker health check implementation

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /me` - Get current user profile

### User Management Routes (`/api/users`)

- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID (admin/support only)
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `PUT /:id/status` - Update user status (admin only)
- `PUT /:id/role` - Update user role (admin only)
- `DELETE /:id` - Delete user (admin only)
- `GET /stats/overview` - Get user statistics (admin only)

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/banking_auth

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

## Installation & Setup

### Using Docker (Recommended)

1. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

2. **For development with MongoDB Express:**
```bash
docker-compose --profile dev up -d
```

3. **Access the service:**
- Authentication Service: http://localhost:3001
- MongoDB Express (dev): http://localhost:8081 (admin/admin123)

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name auth-mongo mongo:7.0

# Or use local MongoDB installation
```

3. **Run the service:**
```bash
# Development
npm run dev

# Production
npm start
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Account Security
- Account lockout after 5 failed login attempts
- 2-hour lockout duration
- JWT token expiration (15 minutes for access, 7 days for refresh)
- Secure password hashing with bcrypt

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable rate limiting rules

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Default Admin User

For development, a default admin user is created:
- **Email:** admin@bankingapp.com
- **Password:** Admin123!

**⚠️ Important:** Remove or change this in production!

## Health Check

The service includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "service": "authentication-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Docker Commands

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 3001:3001 auth-service

# View logs
docker-compose logs -f auth-service

# Scale service
docker-compose up -d --scale auth-service=3
```

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Monitoring

The service includes built-in logging and monitoring:
- Request logging with Morgan
- Error tracking and stack traces
- Performance monitoring via health checks
- Database connection monitoring

## Production Considerations

1. **Security:**
   - Use strong, unique JWT secrets
   - Enable HTTPS in production
   - Configure proper CORS origins
   - Set up proper firewall rules

2. **Database:**
   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication and authorization
   - Set up proper backup strategies
   - Configure replica sets for high availability

3. **Monitoring:**
   - Set up application monitoring (e.g., New Relic, DataDog)
   - Configure log aggregation (e.g., ELK stack)
   - Set up alerting for critical failures

4. **Performance:**
   - Configure connection pooling
   - Set up database indexes
   - Implement caching strategies
   - Use load balancers for scaling