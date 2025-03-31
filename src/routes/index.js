const express = require('express');
const router = express.Router();

// Import route modules
// const userRoutes = require('./userRoutes');
// const eventRoutes = require('./eventRoutes');

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: req.t('welcome') });
});

// Use route modules
// router.use('/users', userRoutes);
// router.use('/events', eventRoutes);

module.exports = router;