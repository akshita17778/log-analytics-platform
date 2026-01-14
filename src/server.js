/**
 * Main Server Application
 * Express setup, middleware configuration, and route initialization
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { connectDB, disconnectDB } = require('./config/database');
const {
  errorHandler,
  validationErrorHandler,
  requestLogger
} = require('./middleware/errorHandler');

// Import routes
const logRoutes = require('./routes/logRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK & STATUS ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * API status endpoint
 */
app.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'Log Analytics & Incident Intelligence Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Log Management Routes
 * POST /logs/ingest - Ingest single log
 * POST /logs/batch - Batch ingest logs
 * GET /logs/service/:serviceName - Get logs by service
 * GET /logs/severity/:severity - Get logs by severity
 * GET /logs/trace/:requestId - Trace request logs
 * GET /logs/recent - Get recent logs
 * GET /logs/stats - Get log statistics
 */
app.use('/logs', logRoutes);

/**
 * Analytics Routes
 * GET /analytics/error-frequency - Error frequency by service
 * GET /analytics/top-failing-services - Top failing services
 * GET /analytics/error-trends - Error trends over time
 * GET /analytics/severity-breakdown - Error breakdown by severity
 * GET /analytics/service-health - Service health summary
 * GET /analytics/error-correlation - Correlated errors
 */
app.use('/analytics', analyticsRoutes);

/**
 * Incident Management Routes
 * GET /incidents - Get incidents
 * GET /incidents/critical - Get critical incidents
 * GET /incidents/sla-breached - Get SLA-breached incidents
 * GET /incidents/:incidentId - Get incident details
 * PATCH /incidents/:incidentId - Update incident
 * GET /incidents/stats/summary - Get incident statistics
 * POST /incidents/auto-resolve - Auto-resolve stale incidents
 */
app.use('/incidents', incidentRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${req.path}`
    }
  });
});

/**
 * Error handling middleware
 */
app.use(validationErrorHandler);
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  📊 Log Analytics & Incident Intelligence Platform            ║
║                                                                ║
║  ✓ Server running on http://localhost:${PORT}                      ║
║  ✓ Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)} ║
║  ✓ MongoDB: Connected                                         ║
║                                                                ║
║  📚 API Documentation:                                         ║
║  • GET  /health              - Health check                   ║
║  • GET  /status              - API status                     ║
║  • POST /logs/ingest         - Ingest single log              ║
║  • POST /logs/batch          - Batch ingest logs              ║
║  • GET  /logs/service/:name  - Get logs by service            ║
║  • GET  /analytics/...       - Analytics endpoints            ║
║  • GET  /incidents/...       - Incident management            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('[FATAL] Failed to start server:', error.message);
    process.exit(1);
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] SIGTERM signal received');
  try {
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[SHUTDOWN] Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('[SHUTDOWN] SIGINT signal received');
  try {
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[SHUTDOWN] Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = app;
