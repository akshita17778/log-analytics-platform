/**
 * Routes: Analytics
 * Endpoints for log analysis and metrics
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * GET /analytics/error-frequency
 * Get error frequency breakdown by service
 * Query: ?startTime=ISO&endTime=ISO
 */
router.get('/error-frequency', analyticsController.getErrorFrequency);

/**
 * GET /analytics/top-failing-services
 * Get services with highest error rates
 * Query: ?limit=10&startTime=ISO&endTime=ISO
 */
router.get('/top-failing-services', analyticsController.getTopFailingServices);

/**
 * GET /analytics/error-trends
 * Get error trends over time
 * Query: ?startTime=ISO&endTime=ISO&granularity=hour|day|minute
 */
router.get('/error-trends', analyticsController.getErrorTrends);

/**
 * GET /analytics/severity-breakdown
 * Get error breakdown by severity level
 * Query: ?startTime=ISO&endTime=ISO
 */
router.get('/severity-breakdown', analyticsController.getSeverityBreakdown);

/**
 * GET /analytics/service-health
 * Get health score for all services
 * Query: ?startTime=ISO&endTime=ISO
 */
router.get('/service-health', analyticsController.getServiceHealth);

/**
 * GET /analytics/error-correlation
 * Get correlated errors (errors affecting same services/users)
 * Query: ?startTime=ISO&endTime=ISO
 */
router.get('/error-correlation', analyticsController.getErrorCorrelation);

module.exports = router;
