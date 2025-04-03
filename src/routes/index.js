const express = require('express');
const userRoutes = require('./userRoutes');
// const eventRoutes = require('./eventRoutes'); // We'll implement this next

const router = express.Router();

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: req.t('welcome') });
});

// Use route modules
router.use('/users', userRoutes);
// router.use('/events', eventRoutes);

module.exports = router;