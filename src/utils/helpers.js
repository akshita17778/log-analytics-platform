/**
 * Utility Functions
 * Helper functions for common operations
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique ID
 */
const generateId = () => uuidv4();

/**
 * Classify incident severity based on error patterns
 * @param {Array} logs - Array of log entries
 * @returns {String} - Classified severity
 */
const classifySeverity = (logs) => {
  const severityMap = { INFO: 0, WARN: 1, ERROR: 2, CRITICAL: 3 };
  
  if (!logs || logs.length === 0) return 'INFO';
  
  const maxSeverity = Math.max(
    ...logs.map(log => severityMap[log.severity] || 0)
  );
  
  const severityArray = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
  return severityArray[maxSeverity];
};

/**
 * Check if SLA has been breached
 * @param {Date} incidentStart - When incident started
 * @param {Number} thresholdMinutes - SLA threshold in minutes
 * @returns {Boolean} - Whether SLA is breached
 */
const checkSLABreach = (incidentStart, thresholdMinutes = 15) => {
  const now = new Date();
  const elapsedMinutes = (now - incidentStart) / (1000 * 60);
  return elapsedMinutes > thresholdMinutes;
};

/**
 * Group logs by service name
 * @param {Array} logs - Array of logs
 * @returns {Object} - Grouped logs
 */
const groupByService = (logs) => {
  return logs.reduce((acc, log) => {
    if (!acc[log.serviceName]) {
      acc[log.serviceName] = [];
    }
    acc[log.serviceName].push(log);
    return acc;
  }, {});
};

/**
 * Calculate error rate for a service
 * @param {Array} logs - Array of logs
 * @returns {Number} - Error rate (0-1)
 */
const calculateErrorRate = (logs) => {
  if (logs.length === 0) return 0;
  
  const errorCount = logs.filter(
    log => log.severity === 'ERROR' || log.severity === 'CRITICAL'
  ).length;
  
  return errorCount / logs.length;
};

/**
 * Generate incident title from logs
 * @param {Array} logs - Array of logs
 * @returns {String} - Generated title
 */
const generateIncidentTitle = (logs) => {
  if (logs.length === 0) return 'Unknown Incident';
  
  const errorCode = logs[0].errorCode || 'UNKNOWN';
  const service = logs[0].serviceName || 'unknown service';
  
  return `[${errorCode}] ${service} - ${logs.length} errors detected`;
};

/**
 * Format time duration for display
 * @param {Number} milliseconds - Duration in milliseconds
 * @returns {String} - Formatted duration
 */
const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Truncate string to max length
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Max length
 * @returns {String} - Truncated string
 */
const truncate = (str, maxLength = 500) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

module.exports = {
  generateId,
  classifySeverity,
  checkSLABreach,
  groupByService,
  calculateErrorRate,
  generateIncidentTitle,
  formatDuration,
  truncate
};
