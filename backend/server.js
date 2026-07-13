/**
 * server.js — LifeVault Express Application Entry Point
 *
 * Initialization order matters:
 *   1. Load environment variables FIRST (dotenv)
 *   2. Connect to database
 *   3. Configure Express middleware (order matters for security)
 *   4. Mount routes
 *   5. Register 404 + global error handler LAST
 */

require('dotenv').config(); // Must be the very first line

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

const connectDB = require('./config/db');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// ── Initialize Express ────────────────────────────────────────────────────────
const app = express();

// Required behind Render/nginx so secure cookies work with X-Forwarded-Proto
app.set('trust proxy', 1);

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────

/**
 * Helmet sets security-related HTTP headers automatically.
 * This is the single most impactful security addition you can make.
 * It protects against: XSS, clickjacking, MIME sniffing, and more.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'], // Allow Cloudinary images
        connectSrc: ["'self'"],
      },
    },
  })
);

/**
 * CORS configuration.
 * In production, replace CLIENT_URL with your actual frontend domain.
 * The `credentials: true` is required for cookies (refresh token) to work cross-origin.
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ]
      .filter(Boolean)
      .map((url) => url.replace(/\/+$/, '')); // strip trailing slash

    // Allow requests with no origin (mobile apps, Postman, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed.`));
    }
  },
  credentials: true,  // Required for httpOnly cookie to be sent/received
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(compression());

/**
 * Global rate limiter — applies to ALL routes.
 * Auth routes have a stricter separate limiter (defined in auth routes).
 *
 * windowMs: 15 minutes
 * max: 100 requests per IP per window
 */
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable the deprecated `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});
app.use(globalRateLimiter);

// ── Request Parsing Middleware ────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // Body size limit prevents payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Required to read httpOnly refresh token cookie

// Express 5: req.query AND req.params are read-only getters — never reassign them.
// Sanitize body and params by mutating in-place using mongoSanitize.
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // mongoSanitize.sanitize mutates the passed-in object and returns it
    mongoSanitize.sanitize(req.body, { onSanitize: undefined });
  }
  next();
});

// ── Logging ───────────────────────────────────────────────────────────────────

/**
 * Morgan HTTP request logger.
 * - Development: 'dev' format (colorized, concise)
 * - Production: 'combined' format (Apache-style, full details for log aggregators)
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Health Check ──────────────────────────────────────────────────────────────
// Simple endpoint for load balancers, Docker, and uptime monitors

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeVault API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Root route — Render / browsers often hit GET/HEAD /
// Without this, logs show scary "route not found" 404s even when the API is healthy.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeVault API',
    health: '/health',
    apiBase: '/api/v1',
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// ── API Routes ────────────────────────────────────────────────────────────────
// All routes are versioned under /api/v1 for future API evolution

app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/profile', require('./routes/profile.routes'));
app.use('/api/v1/medical', require('./routes/medical.routes'));
app.use('/api/v1/documents', require('./routes/document.routes'));
app.use('/api/v1/emergency-contacts', require('./routes/emergencyContact.routes'));
app.use('/api/v1/qr', require('./routes/qr.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1/activity', require('./routes/activity.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/emergency', require('./routes/emergency.routes'));

// Public emergency route — no /api prefix, short URL for QR code scanning
app.use('/emergency', require('./routes/emergency.routes'));

// ── 404 & Global Error Handler ─────────────────────────────────────────────────
// These MUST be registered last, after all routes

app.use(notFound);       // Catches all unmatched routes → ApiError(404)
app.use(errorHandler);   // Handles all errors from the chain

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `\n🚀 LifeVault API running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`   → Health check: http://localhost:${PORT}/health\n`);
});

/**
 * Unhandled Promise Rejection Guard
 *
 * Catches any async promise rejection that wasn't explicitly caught.
 * Logs the error and gracefully shuts down the server.
 * Without this, Node.js would crash silently in older versions.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  server.close(() => {
    console.log('🛑 Server shut down due to unhandled promise rejection.');
    process.exit(1);
  });
});

/**
 * Uncaught Exception Guard
 * Programming errors that escape the normal flow.
 * The process must restart (handled by PM2/Docker in production).
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app; // Export for testing
