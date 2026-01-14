/**
 * Log Model
 * Represents structured logs from applications
 * - Indexes on service name, severity, and timestamp for efficient querying
 * - TTL index for automatic log retention
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    // Identification
    logId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      description: 'Unique identifier for the log'
    },

    // Source Information
    serviceName: {
      type: String,
      required: true,
      index: true,
      description: 'Application or service that generated the log'
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production',
      description: 'Environment where the log originated'
    },
    host: {
      type: String,
      description: 'Hostname or instance ID'
    },

    // Log Severity
    severity: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'],
      required: true,
      index: true,
      description: 'Log severity level'
    },

    // Log Content
    message: {
      type: String,
      required: true,
      description: 'Log message'
    },
    errorCode: {
      type: String,
      description: 'Error code if applicable'
    },
    stackTrace: {
      type: String,
      description: 'Stack trace for errors'
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      description: 'Additional metadata (user ID, request ID, etc.)'
    },
    userId: {
      type: String,
      description: 'Associated user if applicable'
    },
    requestId: {
      type: String,
      description: 'Correlation ID for request tracing'
    },

    // Timestamps
    timestamp: {
      type: Date,
      required: true,
      index: true,
      description: 'When the log occurred'
    }
  },
  {
    timestamps: true,
    collection: 'logs'
  }
);

// Create compound index for efficient analytics queries
logSchema.index({ serviceName: 1, severity: 1, timestamp: -1 });
logSchema.index({ severity: 1, timestamp: -1 });

// TTL index: automatically delete logs after 30 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Log', logSchema);
