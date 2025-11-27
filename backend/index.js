require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: allow frontend origin and credentials
// Accept the configured FRONTEND_URL, or any localhost origin (helps when Vite chooses a different port like 5174)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman) with no origin
    if (!origin) return callback(null, true);
    const configured = process.env.FRONTEND_URL;
    if (configured && origin === configured) return callback(null, true);
    // Allow localhost on any port for development
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
// The global CORS middleware above will handle preflight requests.
app.use(bodyParser.json());

// MongoDB connection
// Use explicit timeouts and modern options. Remove deprecated flags.
mongoose.connect(process.env.MONGODB_URI, {
  // Wait up to 10s for server selection before giving up
  serverSelectionTimeoutMS: 10000,
  // Wait up to 10s for initial TCP connect
  connectTimeoutMS: 10000,
  tls: true,
  tlsInsecure: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Connection event logs for better debugging
mongoose.connection.on('connected', () => console.log('Mongoose: connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose: disconnected from MongoDB'));

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during mongoose shutdown', err);
    process.exit(1);
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Penny Count Backend API is running');
});

// DB health/debug endpoint
app.get('/api/_health/db', (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    res.json({ state });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Importing routers
const usersRouter = require('./routes.users');
const borrowersRouter = require('./routes.borrowers');
const loansRouter = require('./routes.loans');
const paymentsRouter = require('./routes.payments');
const linesRouter = require('./routes.lines');
const collectionsRouter = require('./routes.collections');
const commissionsRouter = require('./routes.commissions');
const analyticsRouter = require('./routes.analytics');
const exportsRouter = require('./routes.exports');
const settingsRouter = require('./routes.settings');
const notificationsRouter = require('./routes.notifications');

// Setting up routes
app.use('/api/users', usersRouter);
app.use('/api/borrowers', borrowersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/lines', linesRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/commissions', commissionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);

// CORS / general error handler to return JSON errors (helpful for debugging)
app.use((err, req, res, next) => {
  if (!err) return next();
  console.error('Express error handler caught:', err && err.message ? err.message : err);
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ message: 'CORS blocked the request', details: err.message });
  }
  res.status(500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
