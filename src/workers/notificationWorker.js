const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

// Create Redis client
const subscriber = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

// Handle Redis errors
subscriber.on('error', (error) => {
  console.error('Redis subscriber error:', error);
});

// Process notifications
const processNotification = (notification) => {
  try {
    const data = JSON.parse(notification);
    
    console.log(`Processing notification for event: ${data.title}`);
    
    // In a real app, you would:
    // 1. Send emails/SMS/push notifications to users
    // 2. Log notifications in the database
    // 3. Handle different languages based on user preferences
    
    data.recipients.forEach(recipient => {
      // Example of language-specific notifications
      const message = recipient.preferredLanguage === 'fr'
        ? `Événement à venir: ${data.title} le ${new Date(data.date).toLocaleDateString('fr-FR')}`
        : `Upcoming event: ${data.title} on ${new Date(data.date).toLocaleDateString('en-US')}`;
      
      console.log(`Sending to user ${recipient.userId}: ${message}`);
      // Here you would integrate with email/SMS/push notification service
    });
    
    return {
      success: true,
      messageCount: data.recipients.length,
    };
  } catch (error) {
    console.error('Error processing notification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Subscribe to the notification channel
subscriber.subscribe('event-notifications');

subscriber.on('message', (channel, message) => {
  console.log(`Received message from channel: ${channel}`);
  const result = processNotification(message);
  
  if (result.success) {
    console.log(`Successfully processed notification and sent ${result.messageCount} messages`);
  } else {
    console.error(`Failed to process notification: ${result.error}`);
  }
});

console.log('Notification worker is running and waiting for messages...');