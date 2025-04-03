const notificationService = require('../services/notificationService');

// Queue notification for an event
const queueEventNotification = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { delay } = req.query;
    
    const result = await notificationService.queueEventNotification(
      eventId,
      delay ? parseInt(delay) : 0
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Queue notification error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Queue notifications for all upcoming events
const queueUpcomingEventNotifications = async (req, res) => {
  try {
    const { daysAhead } = req.query;
    
    const result = await notificationService.queueUpcomingEventNotifications(
      daysAhead ? parseInt(daysAhead) : 1
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Queue upcoming notifications error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  queueEventNotification,
  queueUpcomingEventNotifications,
};
