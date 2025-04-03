module.exports = {
  translation: {
    welcome: 'Welcome to the Event Locator API',
    events: {
      created: 'Event created successfully',
      updated: 'Event updated successfully',
      deleted: 'Event deleted successfully',
      notFound: 'Event not found',
      unauthorized: 'Not authorized to modify this event',
      attendanceConfirmed: 'Your attendance has been confirmed',
      attendanceCancelled: 'Your attendance has been cancelled',
      locationRequired: 'Longitude and latitude are required'
    },
    users: {
      registered: 'User registered successfully',
      loggedIn: 'User logged in successfully',
      notFound: 'User not found',
      invalidCredentials: 'Invalid credentials',
      profileUpdated: 'Profile updated successfully',
      passwordUpdated: 'Password updated successfully',
      alreadyExists: 'User with this email already exists'
    },
    notifications: {
      queued: 'Notification queued successfully',
      upcomingQueued: 'Queued notifications for upcoming events',
      sent: 'Notification sent successfully',
      upcoming: 'Upcoming event:'
    },
    validation: {
      requiredField: 'This field is required',
      invalidEmail: 'Please provide a valid email',
      passwordLength: 'Password must be at least 6 characters long',
      invalidCoordinates: 'Location coordinates must be an array [longitude, latitude]',
      invalidDate: 'Invalid date format',
      categoryRequired: 'At least one category is required',
      languageSupport: 'Language must be either en or fr'
    },
    errors: {
      general: 'Something went wrong',
      unauthorized: 'Authentication required',
      invalidToken: 'Invalid token',
      notFound: 'Resource not found',
      serverError: 'Internal server error',
      redisNotConnected: 'Notification service temporarily unavailable'
    }
  },
};