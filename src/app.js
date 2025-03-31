const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Setup i18n
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    preload: ['en', 'fr'],
    fallbackLng: 'en',
    resources: {
      en: require('./locales/en'),
      fr: require('./locales/fr'),
    },
  });

app.use(i18nextMiddleware.handle(i18next));

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
});

module.exports = app;