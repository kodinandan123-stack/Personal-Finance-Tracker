/**
 * requestLogger.js
 *
 * Express middleware that logs each incoming HTTP request to the console.
 * Intended for development use. In production, swap this out for a
    * structured logger such as winston or pino.
 *
 * Usage:
 *   const requestLogger = require('./middleware/requestLogger');
 *   app.use(requestLogger);
 */

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
          const duration = Date.now() - start;
          const statusCode = res.statusCode;
          const method = req.method.padEnd(7);
          const url = req.originalUrl || req.url;
          const timestamp = new Date().toISOString();

          // Colour-code by status range for quick visual scanning
          let statusLabel;
          if (statusCode >= 500) {
                  statusLabel = `\x1b[31m${statusCode}\x1b[0m`; // red
                } else if (statusCode >= 400) {
                  statusLabel = `\x1b[33m${statusCode}\x1b[0m`; // yellow
                } else if (statusCode >= 300) {
                  statusLabel = `\x1b[36m${statusCode}\x1b[0m`; // cyan
                } else {
                  statusLabel = `\x1b[32m${statusCode}\x1b[0m`; // green
                }

          console.log(`[${timestamp}] ${method} ${url} ${statusLabel} ${duration}ms`);
        });

    next();
  };

module.exports = requestLogger;
