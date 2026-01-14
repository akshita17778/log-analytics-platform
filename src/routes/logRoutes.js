/**
 * Routes: Logs
 * Endpoints for log ingestion and retrieval
 */

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { asyncHandler } = require('../middleware/errorHandler');
const { logSchema, batchLogsSchema } = require('../utils/validators');

/**
 * Validation middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }
    });
  }

  req.body = value;
  next();
};

// Routes
/**
 * POST /logs/ingest
 * Ingest a single structured log entry
 * Body: { serviceName, severity, message, timestamp, ... }
 */
router.post('/ingest', validate(logSchema), logController.ingestLog);

/**
 * POST /logs/batch
 * Ingest multiple log entries at once
 * Body: { logs: [...] }
 */
router.post('/batch', validate(batchLogsSchema), logController.ingestBatch);

/**
 * GET /logs/service/:serviceName
 * Get logs for a specific service
 * Query: ?severity=ERROR&startTime=ISO&endTime=ISO&limit=100&offset=0
 */
router.get('/service/:serviceName', logController.getByService);

/**
 * GET /logs/severity/:severity
 * Get logs by severity level
 * Query: ?startTime=ISO&endTime=ISO&limit=100&offset=0
 */
router.get('/severity/:severity', logController.getBySeverity);

/**
 * GET /logs/trace/:requestId
 * Trace logs by request correlation ID
 */
router.get('/trace/:requestId', logController.traceRequest);

/**
 * GET /logs/recent
 * Get recent log entries
 * Query: ?limit=50&severity=ERROR
 */
router.get('/recent', logController.getRecent);

/**
 * GET /logs/stats
 * Get log statistics (counts by service and severity)
 */
router.get('/stats', logController.getStats);

module.exports = router;
