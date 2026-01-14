/**
 * Log Controller
 * Handles HTTP requests for log operations
 */

const logService = require('../services/logService');
const { asyncHandler } = require('../middleware/errorHandler');

class LogController {
  /**
   * POST /logs/ingest - Ingest a single log
   */
  ingestLog = asyncHandler(async (req, res) => {
    const log = await logService.ingestLog(req.body);

    res.status(201).json({
      success: true,
      data: {
        logId: log.logId,
        message: 'Log ingested successfully'
      }
    });
  });

  /**
   * POST /logs/batch - Ingest multiple logs
   */
  ingestBatch = asyncHandler(async (req, res) => {
    const { logs } = req.body;
    const result = await logService.ingestBatch(logs);

    res.status(201).json({
      success: true,
      data: {
        count: result.length,
        message: `${result.length} logs ingested successfully`
      }
    });
  });

  /**
   * GET /logs/service/:serviceName - Get logs by service
   */
  getByService = asyncHandler(async (req, res) => {
    const { serviceName } = req.params;
    const { severity, startTime, endTime, limit, offset } = req.query;

    const logs = await logService.getLogsByService(serviceName, {
      severity: severity || null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });

    res.json({
      success: true,
      data: {
        count: logs.length,
        logs
      }
    });
  });

  /**
   * GET /logs/severity/:severity - Get logs by severity
   */
  getBySeverity = asyncHandler(async (req, res) => {
    const { severity } = req.params;
    const { startTime, endTime, limit, offset } = req.query;

    const logs = await logService.getLogsBySeverity(severity, {
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });

    res.json({
      success: true,
      data: {
        count: logs.length,
        logs
      }
    });
  });

  /**
   * GET /logs/trace/:requestId - Get logs by request ID (tracing)
   */
  traceRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const logs = await logService.getLogsByRequestId(requestId);

    res.json({
      success: true,
      data: {
        requestId,
        count: logs.length,
        logs
      }
    });
  });

  /**
   * GET /logs/recent - Get recent logs
   */
  getRecent = asyncHandler(async (req, res) => {
    const { limit, severity } = req.query;

    const logs = await logService.getRecentLogs({
      limit: parseInt(limit) || 50,
      severity: severity || null
    });

    res.json({
      success: true,
      data: {
        count: logs.length,
        logs
      }
    });
  });

  /**
   * GET /logs/stats - Get log statistics
   */
  getStats = asyncHandler(async (req, res) => {
    const counts = await logService.getLogCounts();

    res.json({
      success: true,
      data: {
        summary: counts
      }
    });
  });
}

module.exports = new LogController();
