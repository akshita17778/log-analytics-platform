# Enterprise Log Analytics & Incident Intelligence Platform

A production-grade backend system for ingesting, storing, analyzing application logs, and detecting incidents for enterprise IT operations.

## 🎯 Features

- **Log Ingestion API**: Accept structured JSON logs from multiple services
- **Efficient Storage**: MongoDB with strategic indexing for fast queries
- **Real-time Analytics**:
  - Error frequency analysis by service
  - Top failing services identification
  - Error trends over time
  - Service health scoring
- **Incident Intelligence**:
  - Automatic incident grouping and classification
  - SLA breach detection
  - Critical incident prioritization
  - Error correlation analysis
- **Enterprise Architecture**:
  - Clean separation of concerns (routes → controllers → services)
  - Comprehensive validation and error handling
  - Request correlation/tracing support
  - TTL-based automatic log retention

## 🏗️ Architecture

```
src/
├── config/              # Configuration & database setup
│   └── database.js     # MongoDB connection management
├── controllers/         # Request handlers
│   ├── logController.js
│   ├── analyticsController.js
│   └── incidentController.js
├── services/           # Business logic layer
│   ├── logService.js
│   ├── analyticsService.js
│   └── incidentService.js
├── models/             # MongoDB schemas
│   ├── Log.js
│   └── Incident.js
├── routes/             # API endpoints
│   ├── logRoutes.js
│   ├── analyticsRoutes.js
│   └── incidentRoutes.js
├── middleware/         # Express middleware
│   └── errorHandler.js
├── utils/              # Helper functions
│   ├── validators.js   # Joi validation schemas
│   └── helpers.js      # Utility functions
└── server.js          # Main application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- MongoDB >= 4.0
- npm or yarn

### Installation

```bash
# Clone or extract the project
cd log-analytics-platform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB (ensure it's running on localhost:27017)
# or update MONGODB_URI in .env
```

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Health & Status

```http
GET /health
```
Check server health status

```http
GET /status
```
Get API status and version information

### 📝 Log Ingestion

#### Ingest Single Log
```http
POST /logs/ingest
Content-Type: application/json

{
  "serviceName": "payment-service",
  "environment": "production",
  "host": "pod-123",
  "severity": "ERROR",
  "message": "Payment processing failed",
  "errorCode": "PAYMENT_TIMEOUT",
  "stackTrace": "...",
  "metadata": {
    "paymentId": "pay-456",
    "amount": 99.99
  },
  "userId": "user-789",
  "requestId": "req-123-456-789",
  "timestamp": "2024-01-14T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logId": "uuid",
    "message": "Log ingested successfully"
  }
}
```

#### Batch Ingest Logs
```http
POST /logs/batch
Content-Type: application/json

{
  "logs": [
    { "serviceName": "api", "severity": "ERROR", ... },
    { "serviceName": "db", "severity": "WARN", ... }
  ]
}
```

### 🔍 Log Retrieval

#### Get Logs by Service
```http
GET /logs/service/payment-service?severity=ERROR&limit=50&offset=0
```

**Query Parameters:**
- `severity`: Filter by severity (INFO, WARN, ERROR, CRITICAL)
- `startTime`: ISO timestamp for range start
- `endTime`: ISO timestamp for range end
- `limit`: Results per page (default: 100)
- `offset`: Pagination offset (default: 0)

#### Get Logs by Severity
```http
GET /logs/severity/CRITICAL?limit=50
```

#### Request Tracing
```http
GET /logs/trace/req-123-456-789
```
Get all logs for a request correlation ID

#### Recent Logs
```http
GET /logs/recent?limit=50&severity=ERROR
```

#### Log Statistics
```http
GET /logs/stats
```

### 📊 Analytics Endpoints

#### Error Frequency by Service
```http
GET /analytics/error-frequency
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "_id": "payment-service",
        "errorCount": 245
      }
    ]
  }
}
```

#### Top Failing Services
```http
GET /analytics/top-failing-services?limit=10&startTime=2024-01-14T00:00:00Z
```

#### Error Trends
```http
GET /analytics/error-trends?startTime=2024-01-13T00:00:00Z&granularity=hour
```

**Query Parameters:**
- `granularity`: Time bucket (minute, hour, day)
- `startTime`: Start of time range
- `endTime`: End of time range

#### Severity Breakdown
```http
GET /analytics/severity-breakdown
```

#### Service Health
```http
GET /analytics/service-health
```

Returns health score (0-100) for each service based on error rate.

#### Error Correlation
```http
GET /analytics/error-correlation
```

Find errors affecting same services/users.

### 🚨 Incident Management

#### Get Incidents
```http
GET /incidents?status=OPEN&severity=CRITICAL&limit=20
```

**Query Parameters:**
- `status`: OPEN, ACKNOWLEDGED, RESOLVED
- `severity`: ERROR severity level
- `serviceName`: Filter by service
- `limit`: Results per page
- `offset`: Pagination offset

#### Get Critical Incidents
```http
GET /incidents/critical?limit=10
```

#### Get SLA-Breached Incidents
```http
GET /incidents/sla-breached?limit=20
```

#### Get Incident Details
```http
GET /incidents/incident-id-123
```

Includes related logs

#### Update Incident
```http
PATCH /incidents/incident-id-123
Content-Type: application/json

{
  "status": "ACKNOWLEDGED",
  "assignedTo": "oncall@company.com",
  "tags": ["database", "performance"]
}
```

#### Get Incident Statistics
```http
GET /incidents/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "open": 45,
    "acknowledged": 30,
    "slaBreached": 12,
    "bySeverity": [
      { "_id": "CRITICAL", "count": 5 },
      { "_id": "ERROR", "count": 40 }
    ],
    "topServices": [
      { "_id": "api", "count": 30 }
    ]
  }
}
```

#### Auto-Resolve Incidents
```http
POST /incidents/auto-resolve
Content-Type: application/json

{
  "thresholdMinutes": 60
}
```

Resolves incidents with no new errors for specified duration.

## 🔧 Configuration

Environment variables in `.env`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/log-analytics
MONGODB_POOL_SIZE=10

# Logging
LOG_RETENTION_DAYS=30

# Incident Detection
ERROR_RATE_THRESHOLD=0.1
CRITICAL_ERROR_THRESHOLD=5
SLA_BREACH_MINUTES=15

# Analytics
ANALYTICS_AGGREGATION_INTERVAL_MINUTES=5

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://dashboard.company.com
```

## 📦 Data Models

### Log Schema

```javascript
{
  logId: String (unique),
  serviceName: String (indexed),
  environment: 'development' | 'staging' | 'production',
  host: String,
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' (indexed),
  message: String,
  errorCode: String,
  stackTrace: String,
  metadata: Object,
  userId: String,
  requestId: String,
  timestamp: Date (indexed, TTL: 30 days)
}
```

**Indexes:**
- `{ serviceName: 1, severity: 1, timestamp: -1 }`
- `{ severity: 1, timestamp: -1 }`
- TTL: Auto-delete after 30 days

### Incident Schema

```javascript
{
  incidentId: String (unique),
  serviceName: String (indexed),
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' (indexed),
  errorCode: String,
  title: String,
  description: String,
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' (indexed),
  logIds: [String],
  errorCount: Number,
  affectedServices: [String],
  affectedUsers: [String],
  slaBreached: Boolean,
  breachTime: Date,
  detectedAt: Date (indexed),
  firstOccurrence: Date,
  lastOccurrence: Date,
  resolvedAt: Date,
  tags: [String],
  assignedTo: String
}
```

## 🧪 Example Usage

### Sample Request Flow

1. **Send logs from service:**
```bash
curl -X POST http://localhost:3000/logs/batch \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "serviceName": "user-service",
        "severity": "ERROR",
        "message": "Database connection timeout",
        "errorCode": "DB_TIMEOUT",
        "timestamp": "2024-01-14T10:30:00Z"
      }
    ]
  }'
```

2. **Check analytics:**
```bash
curl http://localhost:3000/analytics/top-failing-services?limit=5
```

3. **Get incidents:**
```bash
curl http://localhost:3000/incidents?status=OPEN&limit=10
```

4. **Acknowledge incident:**
```bash
curl -X PATCH http://localhost:3000/incidents/incident-id \
  -H "Content-Type: application/json" \
  -d '{"status": "ACKNOWLEDGED", "assignedTo": "engineer@company.com"}'
```

## 🛡️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
- `DB_ERROR`: Database operation failed

## 📈 Performance Considerations

- **Batch Ingestion**: Use `/logs/batch` for high-volume ingestion (up to 1000 logs per request)
- **Indexing**: Strategic indexes on frequently queried fields
- **TTL Indexes**: Automatic log retention to manage storage
- **Connection Pooling**: MongoDB connection pool (size: 10)
- **Compression**: gzip compression on all responses
- **Pagination**: Always use limit/offset for large datasets

## 🔒 Security

- **Helmet**: Security headers
- **CORS**: Configurable allowed origins
- **Validation**: Joi schemas for all inputs
- **Error Handling**: No stack traces in production

## 🚀 Deployment Recommendations

1. **Docker**: Containerize the application
2. **Environment Variables**: Use secure secrets management
3. **Monitoring**: Implement health check integrations
4. **Logging**: Centralize application logs
5. **Database**: Use MongoDB Atlas or managed MongoDB service
6. **Load Balancing**: Use reverse proxy (nginx, HAProxy)
7. **Rate Limiting**: Add rate limiter middleware
8. **Caching**: Implement Redis for analytics caching

## 📝 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Project Structure Explanation

- **Services**: Contain business logic, database queries, and external integrations
- **Controllers**: Handle HTTP requests/responses, call services
- **Routes**: Define endpoints and apply middleware
- **Models**: Define MongoDB schemas with proper indexes
- **Middleware**: Handle cross-cutting concerns (logging, errors, validation)
- **Utils**: Reusable functions and validation schemas

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive comments for complex logic
3. Update API documentation for new endpoints
4. Test with sample data before committing

## 📄 License

MIT

---

**Questions?** Check the inline code comments for implementation details on specific features.
