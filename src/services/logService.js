/**
 * Log Service
 * Business logic for log operations
 */

const Log = require('../models/Log');
const { generateId } = require('../utils/helpers');

class LogService {
  /**
   * Ingest a single log entry
   * @param {Object} logData - Log data to ingest
   * @returns {Promise<Object>} - Created log document
   */
  async ingestLog(logData) {
    const log = new Log({
      logId: generateId(),
      ...logData
    });
    
    return await log.save();
  }

  /**
   * Ingest multiple logs in batch
   * @param {Array} logsData - Array of log data
   * @returns {Promise<Array>} - Created log documents
   */
  async ingestBatch(logsData) {
    const logs = logsData.map(data => ({
      logId: generateId(),
      ...data
    }));
    
    return await Log.insertMany(logs, { ordered: false });
  }

  /**
   * Get logs by service name
   * @param {String} serviceName - Service name to filter
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Filtered logs
   */
  async getLogsByService(serviceName, options = {}) {
    const {
      severity = null,
      startTime = null,
      endTime = null,
      limit = 100,
      offset = 0
    } = options;

    const query = { serviceName };

    if (severity) {
      query.severity = severity;
    }

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    return await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get logs by severity
   * @param {String} severity - Severity level
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Filtered logs
   */
  async getLogsBySeverity(severity, options = {}) {
    const {
      startTime = null,
      endTime = null,
      limit = 100,
      offset = 0
    } = options;

    const query = { severity };

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    return await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get logs by correlation ID (request tracing)
   * @param {String} requestId - Request correlation ID
   * @returns {Promise<Array>} - Related logs
   */
  async getLogsByRequestId(requestId) {
    return await Log.find({ requestId })
      .sort({ timestamp: 1 })
      .lean();
  }

  /**
   * Get recent logs
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Recent logs
   */
  async getRecentLogs(options = {}) {
    const {
      limit = 50,
      severity = null
    } = options;

    const query = {};
    if (severity) query.severity = severity;

    return await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Count logs by service and severity
   * @returns {Promise<Array>} - Count aggregation
   */
  async getLogCounts() {
    return await Log.aggregate([
      {
        $group: {
          _id: {
            service: '$serviceName',
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Delete old logs (cleanup)
   * @param {Date} before - Delete logs before this date
   * @returns {Promise<Object>} - Delete result
   */
  async deleteOldLogs(before) {
    return await Log.deleteMany({ timestamp: { $lt: before } });
  }
}

module.exports = new LogService();
