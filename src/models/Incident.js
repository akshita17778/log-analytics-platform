/**
 * Incident Model
 * Represents detected incidents/alerts based on log analysis
 * - Groups related errors
 * - Tracks severity and SLA status
 * - Links back to source logs
 */

const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    // Identification
    incidentId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      description: 'Unique identifier for the incident'
    },

    // Classification
    serviceName: {
      type: String,
      required: true,
      index: true,
      description: 'Service where incident occurred'
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'],
      required: true,
      index: true,
      description: 'Incident severity'
    },
    errorCode: {
      type: String,
      description: 'Primary error code for incident'
    },

    // Incident Details
    title: {
      type: String,
      required: true,
      description: 'Human-readable incident title'
    },
    description: {
      type: String,
      description: 'Detailed description'
    },

    // Status and SLA
    status: {
      type: String,
      enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'OPEN',
      index: true,
      description: 'Current incident status'
    },
    slaBreached: {
      type: Boolean,
      default: false,
      description: 'Whether SLA threshold was exceeded'
    },
    breachTime: {
      type: Date,
      description: 'When SLA was breached'
    },

    // Log Correlation
    logIds: {
      type: [String],
      description: 'Associated log IDs'
    },
    errorCount: {
      type: Number,
      default: 1,
      description: 'Number of errors in this incident'
    },
    affectedServices: {
      type: [String],
      description: 'List of affected services'
    },
    affectedUsers: {
      type: [String],
      description: 'List of affected users'
    },

    // Timeline
    detectedAt: {
      type: Date,
      required: true,
      index: true,
      description: 'When incident was detected'
    },
    firstOccurrence: {
      type: Date,
      description: 'When error first appeared'
    },
    lastOccurrence: {
      type: Date,
      description: 'Most recent error occurrence'
    },
    resolvedAt: {
      type: Date,
      description: 'When incident was resolved'
    },

    // Metadata
    tags: {
      type: [String],
      description: 'Tags for categorization'
    },
    assignedTo: {
      type: String,
      description: 'Assigned oncall engineer'
    }
  },
  {
    timestamps: true,
    collection: 'incidents'
  }
);

// Create compound indexes for efficient queries
incidentSchema.index({ serviceName: 1, status: 1, detectedAt: -1 });
incidentSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
