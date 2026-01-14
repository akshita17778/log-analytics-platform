# System Architecture

## Overview

The Log Analytics & Incident Intelligence Platform is designed as a modular, scalable backend system following enterprise architectural patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                      API Clients                             │
│          (Services, Dashboards, Integrations)                │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Express.js Server                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Middleware Layer                                     │   │
│  │ • Request Logging   • Error Handling                │   │
│  │ • CORS              • Validation                     │   │
│  │ • Compression       • Security (Helmet)             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴────────┬─────────────────┐
         │                │                 │
    ┌────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
    │ Log Route │  │Analytics   │  │ Incident    │
    │ Handlers  │  │ Handlers   │  │ Handlers    │
    └────┬──────┘  └──────┬─────┘  └──────┬──────┘
         │                 │               │
    ┌────▼──────┐  ┌──────▼─────┐  ┌─────▼──────┐
    │Log Control│  │Analytics   │  │Incident    │
    │ler        │  │Controller  │  │Controller  │
    └────┬──────┘  └──────┬─────┘  └─────┬──────┘
         │                 │               │
    ┌────▼──────┐  ┌──────▼─────┐  ┌─────▼──────┐
    │Log Service│  │Analytics   │  │Incident    │
    │           │  │Service     │  │Service     │
    └────┬──────┘  └──────┬─────┘  └─────┬──────┘
         │                 │               │
         └─────────────────┴───────────────┘
                    │
         ┌──────────▼──────────┐
         │   MongoDB           │
         │   ┌──────────────┐  │
         │   │ Logs Index   │  │
         │   │ Incidents    │  │
         │   │ (TTL, Indexes)  │
         │   └──────────────┘  │
         └─────────────────────┘
```

## Layer Architecture

### 1. Route Layer (`src/routes/`)

**Responsibility**: Define API endpoints and map HTTP requests to controllers

**Components**:
- `logRoutes.js`: Log ingestion and retrieval endpoints
- `analyticsRoutes.js`: Analytics and metrics endpoints
- `incidentRoutes.js`: Incident management endpoints

**Key Features**:
- Request validation middleware
- Route documentation comments
- Query parameter handling

### 2. Controller Layer (`src/controllers/`)

**Responsibility**: Handle HTTP requests/responses, delegate to services

**Components**:
- `logController.js`: Log operations
- `analyticsController.js`: Analytics queries
- `incidentController.js`: Incident management

**Key Features**:
- Async/await with error handling
- Request parameter extraction
- Response formatting
- Status code management

### 3. Service Layer (`src/services/`)

**Responsibility**: Business logic, data processing, orchestration

**Components**:
- `logService.js`: Log ingestion, retrieval, filtering
- `analyticsService.js`: Metrics computation, aggregations
- `incidentService.js`: Incident detection, classification, management

**Key Features**:
- Complex query logic
- Data transformation
- MongoDB aggregation pipelines
- Business rule enforcement

### 4. Data Access Layer (`src/models/`)

**Responsibility**: MongoDB schema definitions and indexing

**Components**:
- `Log.js`: Log schema with indexes for performance
- `Incident.js`: Incident schema with query optimization

**Features**:
- Compound indexes for common queries
- TTL indexes for automatic cleanup
- Schema validation
- Field documentation

## Data Flow Examples

### Log Ingestion Flow

```
POST /logs/ingest
    ↓
[logRoutes.js] - Route definition
    ↓
[Validation Middleware] - Joi schema validation
    ↓
[logController.ingestLog()] - Request handler
    ↓
[logService.ingestLog()] - Business logic
    ↓
[Log.save()] - MongoDB insert
    ↓
Response: { success: true, logId: "..." }
```

### Analytics Query Flow

```
GET /analytics/top-failing-services
    ↓
[analyticsRoutes.js] - Route definition
    ↓
[analyticsController.getTopFailingServices()]
    ↓
[analyticsService.getTopFailingServices()]
    ↓
[Log.aggregate()] - MongoDB aggregation pipeline
    ↓
Response: { topServices: [...] }
```

### Incident Detection Flow

```
[Batch of logs ingested]
    ↓
[logService.ingestBatch()]
    ↓
[incidentService.detectAndCreateIncident()]
    ↓
[Severity Classification]
    ↓
[SLA Breach Check]
    ↓
[Create Incident Document]
    ↓
[Response: incident created]
```

## Database Schema Design

### Log Collection

```
{
  logId: ObjectId (unique, indexed),
  serviceName: String (indexed),
  environment: String,
  host: String,
  severity: String (indexed),
  message: String,
  errorCode: String,
  stackTrace: String,
  metadata: Object,
  userId: String,
  requestId: String,
  timestamp: Date (indexed, TTL: 30 days)
}

Indexes:
- { serviceName: 1, severity: 1, timestamp: -1 }
- { severity: 1, timestamp: -1 }
- { timestamp: 1 } (TTL index)
```

### Incident Collection

```
{
  incidentId: ObjectId (unique, indexed),
  serviceName: String (indexed),
  severity: String (indexed),
  errorCode: String,
  title: String,
  description: String,
  status: String (indexed),
  logIds: [String],
  errorCount: Number,
  affectedServices: [String],
  affectedUsers: [String],
  slaBreached: Boolean,
  detectedAt: Date (indexed),
  firstOccurrence: Date,
  lastOccurrence: Date,
  resolvedAt: Date,
  tags: [String],
  assignedTo: String,
  timestamps: { createdAt, updatedAt }
}

Indexes:
- { serviceName: 1, status: 1, detectedAt: -1 }
- { severity: 1, status: 1 }
```

## API Structure

### Request/Response Pattern

**Request**:
```json
{
  "serviceName": "payment-service",
  "severity": "ERROR",
  "message": "...",
  "timestamp": "2024-01-14T10:30:00Z"
}
```

**Success Response** (2xx):
```json
{
  "success": true,
  "data": {
    "logId": "...",
    "message": "Log ingested successfully"
  }
}
```

**Error Response** (4xx/5xx):
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [...]
  }
}
```

## Scalability Design

### Horizontal Scaling

**Load Balancer** → Multiple App Instances → MongoDB Cluster

- Stateless application design (no session state in memory)
- Shared MongoDB database for all instances
- Request distribution via round-robin or least-connections

### Vertical Scaling

- MongoDB connection pooling (current: 10)
- Node.js cluster mode
- Resource optimization (compression, pagination)

### Database Optimization

- Strategic indexing on query paths
- TTL indexes for automatic cleanup
- Aggregation pipelines for complex queries
- Connection pooling

### Performance Considerations

```javascript
// Batch operations for throughput
POST /logs/batch (up to 1000 logs)

// Pagination for large datasets
GET /logs/service/name?limit=100&offset=0

// Aggregation pipelines for analytics
// (reduce data transfer vs. application-level processing)
```

## Error Handling Strategy

```
┌─────────────────────┐
│ Request comes in    │
└──────────┬──────────┘
           │
     ┌─────▼─────┐
     │ Validation │──────► [Validation Error]
     └─────┬─────┘
           │ ✓
     ┌─────▼──────────┐
     │ Route Handler  │──────► [Async Wrapper catches errors]
     └─────┬──────────┘
           │ ✓
     ┌─────▼──────────┐
     │ DB Operation   │──────► [DB Error]
     └─────┬──────────┘
           │ ✓
     ┌─────▼──────────┐
     │ Success        │
     └────────────────┘
           │
           ▼
    [Error Handler Middleware]
           │
           ▼
    [Formatted JSON Response]
```

## Security Architecture

### Defense Layers

1. **Input Validation**: Joi schemas
2. **CORS**: Configurable origins
3. **Security Headers**: Helmet.js
4. **Error Handling**: No stack traces in production
5. **Rate Limiting**: Ready for express-rate-limit
6. **Authentication**: Hook point for JWT/OAuth2

### HTTPS/TLS

Use reverse proxy (nginx) with SSL certificates:
```
Clients → HTTPS (nginx) → HTTP (app:3000)
```

## Monitoring & Observability

### Logging Strategy

```javascript
// Request logging
[TIMESTAMP] [METHOD] [PATH] - [STATUS] ([DURATION]ms)

// Error logging
[ERROR] [TIMESTAMP]: [MESSAGE]
[STACK TRACE in development]
```

### Metrics Points

- Request latency
- Error rate by service
- Log ingestion rate
- Analytics query performance
- Database connection pool usage

### Health Checks

```
GET /health → { status: "healthy", uptime: ... }
GET /status → { service: "...", version: "..." }
```

## Development Workflow

### Adding a New Endpoint

1. **Create Route** (`src/routes/`)
   - Define endpoint path and method
   - Add validation middleware

2. **Create Controller** (`src/controllers/`)
   - Handle request extraction
   - Call service layer
   - Format response

3. **Create Service** (`src/services/`)
   - Implement business logic
   - Access models/database

4. **Create/Update Model** (`src/models/`)
   - Define schema if needed
   - Add indexes for query optimization

5. **Update Validators** (`src/utils/validators.js`)
   - Add Joi schema for input validation

6. **Test** (`scripts/testAPI.js`)
   - Add test case for new endpoint

### Code Patterns

**Async/Await Pattern**:
```javascript
const controller = async (req, res) => {
  try {
    const data = await service.getData(req.params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
```

**Service Business Logic**:
```javascript
async operation(input) {
  // Validate input
  // Transform data
  // Query database
  // Apply business rules
  // Return result
}
```

## Future Enhancements

1. **Caching**: Redis for analytics
2. **Real-time**: WebSocket for live incident alerts
3. **Authentication**: JWT/OAuth2
4. **Rate Limiting**: express-rate-limit
5. **Logging**: Winston or Bunyan
6. **Testing**: Jest test suite
7. **Documentation**: Swagger/OpenAPI
8. **Metrics**: Prometheus metrics
9. **Tracing**: Distributed tracing (Jaeger)
10. **ML**: Anomaly detection models
