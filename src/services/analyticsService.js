/**
 * Analytics Service
 * Business logic for analytics and metrics computation
 */

const Log = require('../models/Log');

class AnalyticsService {
  /**
   * Calculate error frequency by service
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Error frequency data
   */
  async getErrorFrequencyByService(options = {}) {
    const { startTime = null, endTime = null } = options;

    const match = {
      severity: { $in: ['ERROR', 'CRITICAL'] }
    };

    if (startTime || endTime) {
      match.timestamp = {};
      if (startTime) match.timestamp.$gte = startTime;
      if (endTime) match.timestamp.$lte = endTime;
    }

    return await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$serviceName',
          errorCount: { $sum: 1 }
        }
      },
      { $sort: { errorCount: -1 } }
    ]);
  }

  /**
   * Get top failing services
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Top failing services
   */
  async getTopFailingServices(options = {}) {
    const { limit = 10, startTime = null, endTime = null } = options;

    const match = {
      severity: { $in: ['ERROR', 'CRITICAL'] }
    };

    if (startTime || endTime) {
      match.timestamp = {};
      if (startTime) match.timestamp.$gte = startTime;
      if (endTime) match.timestamp.$lte = endTime;
    }

    return await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$serviceName',
          errorCount: { $sum: 1 },
          lastError: { $max: '$timestamp' }
        }
      },
      { $sort: { errorCount: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Get error trends over time
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Time series data
   */
  async getErrorTrends(options = {}) {
    const {
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime = new Date(),
      granularity = 'hour'
    } = options;

    // Determine MongoDB date format based on granularity
    const dateFormat = {
      minute: '%Y-%m-%d %H:%M',
      hour: '%Y-%m-%d %H:00',
      day: '%Y-%m-%d'
    }[granularity] || '%Y-%m-%d %H:00';

    const match = {
      severity: { $in: ['ERROR', 'CRITICAL'] },
      timestamp: {
        $gte: startTime,
        $lte: endTime
      }
    };

    return await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$timestamp'
            }
          },
          errorCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Get error breakdown by severity
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Severity breakdown
   */
  async getErrorBySeverity(options = {}) {
    const { startTime = null, endTime = null } = options;

    const match = {};

    if (startTime || endTime) {
      match.timestamp = {};
      if (startTime) match.timestamp.$gte = startTime;
      if (endTime) match.timestamp.$lte = endTime;
    }

    return await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
  }

  /**
   * Get service health summary
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Service health data
   */
  async getServiceHealth(options = {}) {
    const {
      startTime = new Date(Date.now() - 60 * 60 * 1000),
      endTime = new Date()
    } = options;

    const match = {
      timestamp: {
        $gte: startTime,
        $lte: endTime
      }
    };

    const result = await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$serviceName',
          totalLogs: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['ERROR', 'CRITICAL']] },
                1,
                0
              ]
            }
          },
          lastLog: { $max: '$timestamp' }
        }
      },
      {
        $addFields: {
          healthScore: {
            $multiply: [
              { $subtract: [1, { $divide: ['$errorCount', '$totalLogs'] }] },
              100
            ]
          }
        }
      },
      { $sort: { healthScore: 1 } }
    ]);

    return result;
  }

  /**
   * Get error correlation analysis
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Correlated errors
   */
  async getErrorCorrelation(options = {}) {
    const {
      startTime = new Date(Date.now() - 60 * 60 * 1000),
      endTime = new Date()
    } = options;

    const match = {
      severity: { $in: ['ERROR', 'CRITICAL'] },
      timestamp: {
        $gte: startTime,
        $lte: endTime
      }
    };

    return await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            service: '$serviceName',
            errorCode: '$errorCode'
          },
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }
}

module.exports = new AnalyticsService();
