const express = require('express');
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware');

const router = express.Router();

// Queue notification for an event (auth required)
router.post('/events/:eventId', auth, notificationController.queueEventNotification);

// Queue notifications for all upcoming events (auth required)
router.post('/upcoming', auth, notificationController.queueUpcomingEventNotifications);

module.exports = router;
