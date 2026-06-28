const mongoose = require('mongoose');

/**
 * GET /api/health
 *
 * Returns a JSON payload describing the current health of the API and its
 * backing services.  The HTTP status code reflects the overall result:
 *   200  – everything is healthy
 *   503  – one or more services are degraded
 *
 * Response body:
 * {
 *   "status": "ok" | "degraded",
 *   "uptime": <process uptime in seconds>,
 *   "timestamp": <ISO 8601 string>,
 *   "services": {
 *     "database": "connected" | "disconnected"
 *   }
 * }
 */
const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  const healthy = dbState === 1;

  const payload = {
    status: healthy ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
  };

  res.status(healthy ? 200 : 503).json(payload);
};

module.exports = { getHealth };
