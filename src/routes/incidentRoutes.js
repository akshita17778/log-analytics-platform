/**
 * Routes: Incidents
 * Endpoints for incident management and detection
 */

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

/**
 * GET /incidents
 * Get incidents with optional filters
 * Query: ?status=OPEN|ACKNOWLEDGED|RESOLVED&severity=ERROR&serviceName=api&limit=20&offset=0
 */
router.get('/', incidentController.getIncidents);

/**
 * GET /incidents/critical
 * Get critical-severity incidents
 * Query: ?limit=10
 */
router.get('/critical', incidentController.getCritical);

/**
 * GET /incidents/sla-breached
 * Get incidents that have breached SLA thresholds
 * Query: ?limit=20&offset=0
 */
router.get('/sla-breached', incidentController.getSLABreached);

/**
 * GET /incidents/stats/summary
 * Get incident statistics and summary
 */
router.get('/stats/summary', incidentController.getStats);

/**
 * GET /incidents/:incidentId
 * Get detailed information about an incident including related logs
 */
router.get('/:incidentId', incidentController.getDetail);

/**
 * PATCH /incidents/:incidentId
 * Update incident status, assignment, or tags
 * Body: { status: 'ACKNOWLEDGED'|'RESOLVED', assignedTo: 'eng@company.com', tags: [...] }
 */
router.patch('/:incidentId', incidentController.update);

/**
 * POST /incidents/auto-resolve
 * Trigger automatic incident resolution for stale incidents
 * Body: { thresholdMinutes: 60 }
 */
router.post('/auto-resolve', incidentController.autoResolve);

module.exports = router;
