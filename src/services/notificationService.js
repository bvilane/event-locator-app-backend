const redis = require('redis');
const { promisify } = require('util');
const { User, Event } = require('../models');

// Create Redis client
let redisClient;
try {
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || '',
  });

  redisClient.on('error', (error) => {
    console.error('Redis error:', error);
  });

  redisClient.connect().catch(console.error);
} catch (error) {
  console.error('Redis connection error:', error);
}

// Queue notification for an upcoming event
const queueEventNotification = async (eventId, delayInMinutes = 0) => {
  try {
    // Check if Redis is connected
    if (!redisClient || !redisClient.isOpen) {
      console.warn('Redis not connected. Using console for notifications.');
      return await simulateNotification(eventId, delayInMinutes);
    }

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
      eventId: event._id.toString(),
      title: event.title,
      description: event.description,
      location: {
        coordinates: event.location.coordinates,
        address: event.location.address
      },
      date: event.date,
      organizer: event.organizer.name,
      recipients: interestedUsers.map(user => ({
        userId: user._id.toString(),
        preferredLanguage: user.preferredLanguage,
      })),
      createdAt: new Date(),
      scheduledFor: delayInMinutes 
        ? new Date(Date.now() + delayInMinutes * 60000) 
        : new Date(),
    };
    
    // Publish to Redis channel
    await redisClient.publish('event-notifications', JSON.stringify(notificationData));
    
    return {
      message: 'Notification queued successfully',
      notificationData,
    };
  } catch (error) {
    console.error('Queue notification error:', error);
    throw error;
  }
};

// Simulate notification if Redis is not available
const simulateNotification = async (eventId, delayInMinutes = 0) => {
  try {
    // Get event details
    const event = await Event.findById(eventId).populate('organizer', 'name');
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Find users who might be interested in this event
    const interestedUsers = await User.find({
      preferredCategories: { $in: event.categories },
    });
    
    console.log('====== SIMULATED NOTIFICATION ======');
    console.log(`Event: ${event.title}`);
    console.log(`Date: ${event.date}`);
    console.log(`Organizer: ${event.organizer.name}`);
    console.log(`Recipients: ${interestedUsers.length} users`);
    console.log('===================================');
    
    return {
      message: 'Notification simulated successfully (Redis not available)',
      recipients: interestedUsers.length,
    };
  } catch (error) {
    console.error('Simulate notification error:', error);
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