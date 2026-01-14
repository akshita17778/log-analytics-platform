# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 14+ (for local development)
- MongoDB 4.0+ (if not using Docker)

## Local Development Setup

### Without Docker

1. **Install Dependencies**
```bash
npm install
```

2. **Start MongoDB**
```bash
# Using MongoDB locally
mongod --dbpath ./data

# Or using Docker
docker run -d -p 27017:27017 --name mongo mongo:6-alpine
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start the Server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### With Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The app will be available at `http://localhost:3000`

## Production Deployment

### Using Docker

1. **Build Image**
```bash
docker build -t log-analytics:latest .
```

2. **Run Container**
```bash
docker run -d \
  --name log-analytics \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo-host:27017/log-analytics \
  log-analytics:latest
```

### Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: log-analytics
  labels:
    app: log-analytics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: log-analytics
  template:
    metadata:
      labels:
        app: log-analytics
    spec:
      containers:
      - name: log-analytics
        image: log-analytics:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /status
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: log-analytics-service
spec:
  selector:
    app: log-analytics
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development|staging|production)

### Optional
- `PORT`: Server port (default: 3000)
- `LOG_RETENTION_DAYS`: Days to retain logs (default: 30)
- `ERROR_RATE_THRESHOLD`: Error rate threshold (default: 0.1)
- `CRITICAL_ERROR_THRESHOLD`: Count for critical alert (default: 5)
- `SLA_BREACH_MINUTES`: SLA threshold in minutes (default: 15)
- `ALLOWED_ORIGINS`: CORS allowed origins

## Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

### Status Endpoint
```bash
curl http://localhost:3000/status
```

### Enable Application Monitoring

1. **PM2 Process Manager** (for Node.js):
```bash
npm install -g pm2

pm2 start src/server.js --name "log-analytics" --instances max
pm2 save
pm2 startup
```

2. **Application Insights/New Relic**:
Add monitoring SDK to `src/server.js`

3. **Prometheus Metrics**:
Implement `/metrics` endpoint for Prometheus scraping

## Database Backup & Recovery

### MongoDB Backup
```bash
# Backup entire database
mongodump --uri "mongodb://localhost:27017/log-analytics" --out ./backup

# Backup specific collection
mongodump --uri "mongodb://localhost:27017/log-analytics" -c logs --out ./backup
```

### MongoDB Restore
```bash
# Restore entire database
mongorestore --uri "mongodb://localhost:27017/log-analytics" ./backup/log-analytics

# Restore specific collection
mongorestore --uri "mongodb://localhost:27017/log-analytics" -c logs ./backup/log-analytics/logs.bson
```

## Scaling Considerations

### Horizontal Scaling
1. Use load balancer (nginx, HAProxy)
2. Deploy multiple instances behind load balancer
3. Use MongoDB Atlas or managed MongoDB for database

### Vertical Scaling
1. Increase container resources (CPU, memory)
2. Increase MongoDB connection pool size
3. Use caching layer (Redis) for analytics queries

### Performance Optimization
1. **Indexing**: Already optimized in schema
2. **Pagination**: Always paginate large queries
3. **Batch Operations**: Use /logs/batch for bulk ingestion
4. **Caching**: Implement Redis caching for analytics
5. **Rate Limiting**: Add rate limiter middleware

## Security Recommendations

1. **HTTPS**: Use reverse proxy with SSL/TLS
2. **Authentication**: Add JWT or OAuth2
3. **Rate Limiting**: Implement express-rate-limit
4. **Input Validation**: Already implemented with Joi
5. **CORS**: Configure for your domain
6. **Secrets**: Use AWS Secrets Manager, HashiCorp Vault
7. **Network**: Use VPC, security groups, firewalls
8. **Database**: Enable MongoDB authentication and encryption

Example nginx configuration:
```nginx
upstream log-analytics {
    server app:3000;
    server app:3000;
    server app:3000;
}

server {
    listen 443 ssl http2;
    server_name api.company.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://log-analytics;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Connection Issues
```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017/log-analytics"

# Check logs
docker-compose logs mongo
docker-compose logs app
```

### Performance Issues
```bash
# Check MongoDB index status
db.logs.getIndexes()

# Add missing index
db.logs.createIndex({ "serviceName": 1, "severity": 1, "timestamp": -1 })
```

### High Memory Usage
- Reduce log retention period
- Implement pagination
- Use database aggregation pipelines

## Maintenance

### Regular Tasks
- Monitor disk space (MongoDB)
- Review error logs
- Optimize slow queries
- Update dependencies monthly
- Review and rotate logs

### Monthly Checks
```bash
# Check index usage
db.logs.aggregate([{ $indexStats: {} }])

# Cleanup old logs (if auto-cleanup disabled)
db.logs.deleteMany({ timestamp: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })
```

## Support & Logs

Application logs are available via:
```bash
# Docker logs
docker logs -f log-analytics-app

# Docker Compose logs
docker-compose logs -f app

# PM2 logs
pm2 logs log-analytics
```
