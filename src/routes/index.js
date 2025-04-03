const express = require('express');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: req.t('welcome') });
});

// Use route modules
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;