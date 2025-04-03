const express = require('express');
const { notificationController } = require('../controllers');
const { auth } = require('../middleware');

const router = express.Router();

// Queue notification for an event (admin only in a real app)
router.post('/events/:eventId', auth, notificationController.queueEventNotification);

// Queue notifications for all upcoming events (admin only in a real app)
router.post('/upcoming', auth, notificationController.queueUpcomingEventNotifications);

module.exports = router;
