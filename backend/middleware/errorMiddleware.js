// @desc    Not Found middleware - handles unmatched routes
// @usage   Place before errorHandler in server.js
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
      next(error);
      };

      // @desc    Global error handler middleware
      // @usage   Place last in server.js middleware stack
      const errorHandler = (err, req, res, next) => {
        // If headers already sent, delegate to default Express error handler
          if (res.headersSent) {
              return next(err);
                }

                  // Use existing status code or default to 500
                    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

                      // Mongoose CastError (invalid ObjectId)
                        if (err.name === 'CastError' && err.kind === 'ObjectId') {
                            return res.status(400).json({
                                  message: 'Invalid resource ID format',
                                      });
                                        }

                                          // Mongoose ValidationError
                                            if (err.name === 'ValidationError') {
                                                const messages = Object.values(err.errors).map((e) => e.message);
                                                    return res.status(400).json({
                                                          message: 'Validation failed',
                                                                errors: messages,
                                                                    });
                                                                      }

                                                                        // Mongoose duplicate key error
                                                                          if (err.code === 11000) {
                                                                              const field = Object.keys(err.keyValue)[0];
                                                                                  return res.status(400).json({
                                                                                        message: `Duplicate value for field: ${field}`,
                                                                                            });
                                                                                              }

                                                                                                // JWT errors
                                                                                                  if (err.name === 'JsonWebTokenError') {
                                                                                                      return res.status(401).json({ message: 'Invalid token' });
                                                                                                        }
                                                                                                          if (err.name === 'TokenExpiredError') {
                                                                                                              return res.status(401).json({ message: 'Token has expired, please log in again' });
                                                                                                                }
                                                                                                                
                                                                                                                  res.status(statusCode).json({
                                                                                                                      message: err.message || 'Internal Server Error',
                                                                                                                          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
                                                                                                                            });
                                                                                                                            };
                                                                                                                            
                                                                                                                            module.exports = { notFound, errorHandler };
