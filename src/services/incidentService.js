/**
 * Incident Service
 * Business logic for incident detection, classification, and management
 */

const Incident = require('../models/Incident');
const Log = require('../models/Log');
const {
  generateId,
  classifySeverity,
  checkSLABreach,
  generateIncidentTitle,
  calculateErrorRate,
  groupByService
} = require('../utils/helpers');

class IncidentService {
  /**
   * Detect and create incident from logs
   * @param {Array} relatedLogs - Group of related logs
   * @returns {Promise<Object>} - Created incident
   */
  async detectAndCreateIncident(relatedLogs) {
    if (!relatedLogs || relatedLogs.length === 0) {
      throw new Error('No logs provided for incident detection');
    }

    const severity = classifySeverity(relatedLogs);
    const errorCode = relatedLogs[0].errorCode || 'UNKNOWN';
    const serviceName = relatedLogs[0].serviceName;
    const firstOccurrence = new Date(Math.min(...relatedLogs.map(l => l.timestamp)));

    const incident = new Incident({
      incidentId: generateId(),
      serviceName,
      severity,
      errorCode,
      title: generateIncidentTitle(relatedLogs),
      description: `Detected ${relatedLogs.length} related errors`,
      logIds: relatedLogs.map(l => l.logId),
      errorCount: relatedLogs.length,
      affectedServices: [...new Set(relatedLogs.map(l => l.serviceName))],
      affectedUsers: [...new Set(relatedLogs.map(l => l.userId).filter(Boolean))],
      detectedAt: new Date(),
      firstOccurrence,
      lastOccurrence: new Date(Math.max(...relatedLogs.map(l => l.timestamp))),
      slaBreached: checkSLABreach(firstOccurrence),
      status: 'OPEN',
      tags: ['auto-detected', errorCode.toLowerCase()]
    });

    return await incident.save();
  }

  /**
   * Get incidents by status
   * @param {String} status - Incident status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Incidents
   */
  async getIncidentsByStatus(status, options = {}) {
    const { limit = 20, offset = 0 } = options;

    return await Incident.find({ status })
      .sort({ detectedAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get incidents by service
   * @param {String} serviceName - Service name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Incidents
   */
  async getIncidentsByService(serviceName, options = {}) {
    const { status = null, limit = 20, offset = 0 } = options;

    const query = { serviceName };
    if (status) query.status = status;

    return await Incident.find(query)
      .sort({ detectedAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get SLA-breached incidents
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - SLA-breached incidents
   */
  async getSLABreachedIncidents(options = {}) {
    const { limit = 20, offset = 0 } = options;

    return await Incident.find({
      slaBreached: true,
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] }
    })
      .sort({ detectedAt: 1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get incident by ID
   * @param {String} incidentId - Incident ID
   * @returns {Promise<Object>} - Incident details with related logs
   */
  async getIncidentDetail(incidentId) {
    const incident = await Incident.findOne({ incidentId }).lean();

    if (!incident) {
      return null;
    }

    // Fetch related logs
    const logs = await Log.find({
      logId: { $in: incident.logIds }
    })
      .sort({ timestamp: -1 })
      .lean();

    return {
      ...incident,
      logs
    };
  }

  /**
   * Update incident status
   * @param {String} incidentId - Incident ID
   * @param {Object} updates - Update fields
   * @returns {Promise<Object>} - Updated incident
   */
  async updateIncident(incidentId, updates) {
    const incident = await Incident.findOneAndUpdate(
      { incidentId },
      {
        ...updates,
        ...(updates.status === 'RESOLVED' && { resolvedAt: new Date() })
      },
      { new: true }
    );

    return incident;
  }

  /**
   * Get critical incidents
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Critical incidents
   */
  async getCriticalIncidents(options = {}) {
    const { limit = 10 } = options;

    return await Incident.find({
      severity: 'CRITICAL',
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] }
    })
      .sort({ detectedAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get incident statistics
   * @returns {Promise<Object>} - Statistics
   */
  async getIncidentStats() {
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({ status: 'OPEN' });
    const acknowledgedIncidents = await Incident.countDocuments({
      status: 'ACKNOWLEDGED'
    });
    const slaBreachedIncidents = await Incident.countDocuments({
      slaBreached: true
    });

    const bySeverity = await Incident.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const byService = await Incident.aggregate([
      {
        $group: {
          _id: '$serviceName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      total: totalIncidents,
      open: openIncidents,
      acknowledged: acknowledgedIncidents,
      slaBreached: slaBreachedIncidents,
      bySeverity,
      topServices: byService
    };
  }

  /**
   * Auto-resolve resolved incidents
   * Mark incidents as resolved after no new errors for threshold time
   * @param {Number} thresholdMinutes - Minutes without errors to mark as resolved
   * @returns {Promise<Object>} - Update result
   */
  async autoResolveIncidents(thresholdMinutes = 60) {
    const thresholdTime = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    return await Incident.updateMany(
      {
        status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
        lastOccurrence: { $lt: thresholdTime }
      },
      {
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    );
  }
}

module.exports = new IncidentService();
