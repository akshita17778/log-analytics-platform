/**
 * Sample Data Generator
 * Creates realistic log and incident data for testing
 */

const sampleLogs = [
  {
    serviceName: 'payment-service',
    environment: 'production',
    host: 'payment-pod-1',
    severity: 'ERROR',
    message: 'Payment processing failed due to gateway timeout',
    errorCode: 'PAYMENT_TIMEOUT',
    stackTrace: 'Error at PaymentGateway.process (payment.js:145:12)\n at async handlePayment (router.js:89:3)',
    metadata: {
      gatewayName: 'Stripe',
      retryCount: 3,
      amount: 99.99,
      currency: 'USD'
    },
    userId: 'user-12345',
    requestId: 'req-payment-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 mins ago
  },
  {
    serviceName: 'payment-service',
    environment: 'production',
    host: 'payment-pod-2',
    severity: 'CRITICAL',
    message: 'Multiple payment processing failures detected',
    errorCode: 'PAYMENT_FAILURE_SPIKE',
    metadata: {
      failureRate: 0.45,
      failureCount: 450,
      windowSize: '5m'
    },
    requestId: 'req-payment-002',
    timestamp: new Date(Date.now() - 3 * 60 * 1000)
  },
  {
    serviceName: 'user-service',
    environment: 'production',
    host: 'user-pod-1',
    severity: 'WARN',
    message: 'High database connection pool usage',
    errorCode: 'DB_POOL_WARNING',
    metadata: {
      poolSize: 100,
      activeConnections: 95,
      waitingRequests: 12
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    serviceName: 'api-gateway',
    environment: 'production',
    host: 'gateway-1',
    severity: 'ERROR',
    message: 'Downstream service unreachable',
    errorCode: 'SERVICE_UNAVAILABLE',
    metadata: {
      downstreamService: 'inventory-service',
      statusCode: 503,
      retries: 5
    },
    requestId: 'req-gateway-001',
    timestamp: new Date(Date.now() - 1 * 60 * 1000)
  },
  {
    serviceName: 'notification-service',
    environment: 'production',
    host: 'notify-1',
    severity: 'WARN',
    message: 'Email delivery queue backlog detected',
    errorCode: 'QUEUE_BACKLOG',
    metadata: {
      queueDepth: 5000,
      avgProcessingTime: 500 // ms
    },
    timestamp: new Date()
  },
  {
    serviceName: 'api-gateway',
    environment: 'production',
    host: 'gateway-2',
    severity: 'ERROR',
    message: 'Downstream service unreachable',
    errorCode: 'SERVICE_UNAVAILABLE',
    metadata: {
      downstreamService: 'inventory-service',
      statusCode: 503,
      retries: 5
    },
    requestId: 'req-gateway-002',
    timestamp: new Date(Date.now() - 30 * 1000)
  }
];

const sampleIncidents = [
  {
    serviceName: 'payment-service',
    severity: 'CRITICAL',
    errorCode: 'PAYMENT_TIMEOUT',
    title: '[PAYMENT_TIMEOUT] payment-service - 2 errors detected',
    description: 'Payment processing is failing with timeout errors',
    status: 'OPEN',
    logIds: ['log-1', 'log-2'],
    errorCount: 2,
    affectedServices: ['payment-service', 'payment-gateway'],
    affectedUsers: ['user-12345', 'user-67890'],
    detectedAt: new Date(Date.now() - 5 * 60 * 1000),
    firstOccurrence: new Date(Date.now() - 6 * 60 * 1000),
    lastOccurrence: new Date(Date.now() - 3 * 60 * 1000),
    slaBreached: true,
    breachTime: new Date(Date.now() - 1 * 60 * 1000),
    tags: ['payment', 'critical', 'sla-breach'],
    assignedTo: 'oncall@company.com'
  },
  {
    serviceName: 'api-gateway',
    severity: 'ERROR',
    errorCode: 'SERVICE_UNAVAILABLE',
    title: '[SERVICE_UNAVAILABLE] api-gateway - 2 errors detected',
    description: 'Inventory service is unreachable',
    status: 'ACKNOWLEDGED',
    logIds: ['log-4', 'log-6'],
    errorCount: 2,
    affectedServices: ['api-gateway', 'inventory-service'],
    detectedAt: new Date(Date.now() - 2 * 60 * 1000),
    firstOccurrence: new Date(Date.now() - 2 * 60 * 1000),
    lastOccurrence: new Date(Date.now() - 30 * 1000),
    slaBreached: false,
    tags: ['downstream', 'dependency'],
    assignedTo: 'backend-team@company.com'
  }
];

module.exports = {
  sampleLogs,
  sampleIncidents
};
