/**
 * Validation Schemas
 * Joi schemas for request validation
 */

const Joi = require('joi');

const logSchema = Joi.object({
  serviceName: Joi.string().required().max(100),
  environment: Joi.string().valid('development', 'staging', 'production'),
  host: Joi.string().max(100),
  severity: Joi.string().required().valid('INFO', 'WARN', 'ERROR', 'CRITICAL'),
  message: Joi.string().required().max(5000),
  errorCode: Joi.string().max(50),
  stackTrace: Joi.string().max(50000),
  metadata: Joi.object(),
  userId: Joi.string().max(100),
  requestId: Joi.string().max(100),
  timestamp: Joi.date().required()
}).required();

/**
 * Batch log submission schema
 * Allows submitting multiple logs at once
 */
const batchLogsSchema = Joi.object({
  logs: Joi.array()
    .items(logSchema)
    .required()
    .max(1000)
    .min(1)
}).required();

/**
 * Analytics query schema
 */
const analyticsQuerySchema = Joi.object({
  serviceName: Joi.string().max(100),
  severity: Joi.string().valid('INFO', 'WARN', 'ERROR', 'CRITICAL'),
  startTime: Joi.date(),
  endTime: Joi.date(),
  granularity: Joi.string().valid('minute', 'hour', 'day').default('hour')
}).required();

/**
 * Incident query schema
 */
const incidentQuerySchema = Joi.object({
  status: Joi.string().valid('OPEN', 'ACKNOWLEDGED', 'RESOLVED'),
  severity: Joi.string().valid('INFO', 'WARN', 'ERROR', 'CRITICAL'),
  serviceName: Joi.string().max(100),
  limit: Joi.number().default(20).max(100),
  offset: Joi.number().default(0)
}).required();

/**
 * Incident update schema
 */
const incidentUpdateSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'ACKNOWLEDGED', 'RESOLVED'),
  assignedTo: Joi.string().max(100),
  tags: Joi.array().items(Joi.string().max(50))
});

module.exports = {
  logSchema,
  batchLogsSchema,
  analyticsQuerySchema,
  incidentQuerySchema,
  incidentUpdateSchema
};
