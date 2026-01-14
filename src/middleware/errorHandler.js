/**
 * Error Handling Middleware
 * Centralizes error responses for consistency and clarity
 */

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, err);

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

/**
 * Validation Error Handler
 * Handles Joi validation errors
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: err.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }
    });
  }
  next(err);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Request Logging Middleware
 * Logs incoming requests for audit trail
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  
  next();
};

module.exports = {
  errorHandler,
  validationErrorHandler,
  asyncHandler,
  requestLogger
};
