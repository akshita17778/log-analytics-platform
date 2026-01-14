/**
 * Incident Controller
 * Handles HTTP requests for incident operations
 */

const incidentService = require('../services/incidentService');
const { asyncHandler } = require('../middleware/errorHandler');

class IncidentController {
  /**
   * GET /incidents - Get incidents with filters
   */
  getIncidents = asyncHandler(async (req, res) => {
    const { status, severity, serviceName, limit, offset } = req.query;

    let incidents;

    if (status) {
      incidents = await incidentService.getIncidentsByStatus(status, {
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0
      });
    } else if (serviceName) {
      incidents = await incidentService.getIncidentsByService(serviceName, {
        status: severity || null,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0
      });
    } else {
      // Get critical incidents by default
      incidents = await incidentService.getCriticalIncidents({
        limit: parseInt(limit) || 20
      });
    }

    res.json({
      success: true,
      data: {
        count: incidents.length,
        incidents
      }
    });
  });

  /**
   * GET /incidents/critical - Get critical incidents
   */
  getCritical = asyncHandler(async (req, res) => {
    const { limit } = req.query;

    const incidents = await incidentService.getCriticalIncidents({
      limit: parseInt(limit) || 10
    });

    res.json({
      success: true,
      data: {
        count: incidents.length,
        incidents
      }
    });
  });

  /**
   * GET /incidents/sla-breached - Get SLA-breached incidents
   */
  getSLABreached = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;

    const incidents = await incidentService.getSLABreachedIncidents({
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    res.json({
      success: true,
      data: {
        count: incidents.length,
        incidents,
        message: 'These incidents have exceeded their SLA threshold'
      }
    });
  });

  /**
   * GET /incidents/:incidentId - Get incident details
   */
  getDetail = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;

    const incident = await incidentService.getIncidentDetail(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found'
        }
      });
    }

    res.json({
      success: true,
      data: incident
    });
  });

  /**
   * PATCH /incidents/:incidentId - Update incident
   */
  update = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const { status, assignedTo, tags } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (tags) updates.tags = tags;

    const incident = await incidentService.updateIncident(incidentId, updates);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        incidentId: incident.incidentId,
        status: incident.status,
        message: 'Incident updated successfully'
      }
    });
  });

  /**
   * GET /incidents/stats/summary - Get incident statistics
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await incidentService.getIncidentStats();

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * POST /incidents/auto-resolve - Trigger auto-resolution
   */
  autoResolve = asyncHandler(async (req, res) => {
    const { thresholdMinutes = 60 } = req.body;

    const result = await incidentService.autoResolveIncidents(thresholdMinutes);

    res.json({
      success: true,
      data: {
        message: `${result.modifiedCount} incidents auto-resolved`,
        resolvedCount: result.modifiedCount
      }
    });
  });
}

module.exports = new IncidentController();
