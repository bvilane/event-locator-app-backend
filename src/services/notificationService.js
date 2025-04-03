const redis = require('redis');
const { promisify } = require('util');
const { User, Event } = require('../models');

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

// Promisify Redis methods
const publishAsync = promisify(redisClient.publish).bind(redisClient);

// Handle Redis errors
redisClient.on('error', (error) => {
  console.error('Redis error:', error);
});

// Queue notification for an upcoming event
const queueEventNotification = async (eventId, delayInMinutes = 0) => {
  try {
    // Get event details
    const event = await Event.findById(eventId).populate('organizer', 'name');
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Find users who might be interested in this event
    const interestedUsers = await User.find({
      preferredCategories: { $in: event.categories },
      // Only include users within a reasonable distance of the event
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: event.location.coordinates,
          },
          $maxDistance: 50000, // 50km radius
        },
      },
    });
    
    // Prepare notification data
    const notificationData = {
      eventId: event._id,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      organizer: event.organizer.name,
      recipients: interestedUsers.map(user => ({
        userId: user._id,
        preferredLanguage: user.preferredLanguage,
      })),
      createdAt: new Date(),
      scheduledFor: delayInMinutes 
        ? new Date(Date.now() + delayInMinutes * 60000) 
        : new Date(),
    };
    
    // Publish to Redis channel
    await publishAsync('event-notifications', JSON.stringify(notificationData));
    
    return {
      message: 'Notification queued successfully',
      notificationData,
    };
  } catch (error) {
    console.error('Queue notification error:', error);
    throw error;
  }
};

// Queue notifications for all upcoming events
const queueUpcomingEventNotifications = async (daysAhead = 1) => {
  try {
    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    
    // Find upcoming events
    const upcomingEvents = await Event.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'active',
    });
    
    // Queue notifications for each event
    const notifications = [];
    for (const event of upcomingEvents) {
      const notification = await queueEventNotification(event._id);
      notifications.push(notification);
    }
    
    return {
      message: `Queued ${notifications.length} notifications for upcoming events`,
      count: notifications.length,
    };
  } catch (error) {
    console.error('Queue upcoming notifications error:', error);
    throw error;
  }
};

module.exports = {
  queueEventNotification,
  queueUpcomingEventNotifications,
};