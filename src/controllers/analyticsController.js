/**
 * Analytics Controller
 * Handles HTTP requests for analytics operations
 */

const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

class AnalyticsController {
  /**
   * GET /analytics/error-frequency - Get error frequency by service
   */
  getErrorFrequency = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const data = await analyticsService.getErrorFrequencyByService({
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null
    });

    res.json({
      success: true,
      data: {
        summary: data
      }
    });
  });

  /**
   * GET /analytics/top-failing-services - Get top failing services
   */
  getTopFailingServices = asyncHandler(async (req, res) => {
    const { limit = 10, startTime, endTime } = req.query;

    const data = await analyticsService.getTopFailingServices({
      limit: parseInt(limit),
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null
    });

    res.json({
      success: true,
      data: {
        topServices: data
      }
    });
  });

  /**
   * GET /analytics/error-trends - Get error trends over time
   */
  getErrorTrends = asyncHandler(async (req, res) => {
    const {
      startTime,
      endTime,
      granularity = 'hour'
    } = req.query;

    const data = await analyticsService.getErrorTrends({
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
      granularity
    });

    res.json({
      success: true,
      data: {
        trends: data
      }
    });
  });

  /**
   * GET /analytics/severity-breakdown - Get error breakdown by severity
   */
  getSeverityBreakdown = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const data = await analyticsService.getErrorBySeverity({
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null
    });

    res.json({
      success: true,
      data: {
        breakdown: data
      }
    });
  });

  /**
   * GET /analytics/service-health - Get service health summary
   */
  getServiceHealth = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const data = await analyticsService.getServiceHealth({
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date()
    });

    res.json({
      success: true,
      data: {
        services: data
      }
    });
  });

  /**
   * GET /analytics/error-correlation - Get correlated errors
   */
  getErrorCorrelation = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const data = await analyticsService.getErrorCorrelation({
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date()
    });

    res.json({
      success: true,
      data: {
        correlations: data
      }
    });
  });
}

module.exports = new AnalyticsController();
