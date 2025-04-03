const { Event } = require('../models');

// Create a new event
const createEvent = async (eventData, userId) => {
  const event = new Event({
    ...eventData,
    organizer: userId,
  });
  
  await event.save();
  return event;
};

// Get all events with pagination and filtering
const getEvents = async (query = {}, options = {}) => {
  const { page = 1, limit = 10, search, category, startDate, endDate } = options;
  
  // Build filter
  const filter = { ...query };
  
  // Add search functionality
  if (search) {
    filter.$text = { $search: search };
  }
  
  // Add category filter
  if (category) {
    filter.categories = { $in: Array.isArray(category) ? category : [category] };
  }
  
  // Add date filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  // Execute query with pagination
  const events = await Event.find(filter)
    .populate('organizer', 'name username')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: 1 });
  
  // Get total count
  const total = await Event.countDocuments(filter);
  
  return {
    events,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
};

// Get event by ID
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate('organizer', 'name username');
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  return event;
};

// Update event
const updateEvent = async (eventId, updates, userId) => {
  // Find event
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Check if user is the organizer
  if (event.organizer.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this event');
  }
  
  // Update event
  Object.assign(event, updates);
  await event.save();
  
  return event;
};

// Delete event
const deleteEvent = async (eventId, userId) => {
  // Find event
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Check if user is the organizer
  if (event.organizer.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this event');
  }
  
  // Delete event
  await Event.deleteOne({ _id: eventId });
  
  return { message: 'Event deleted successfully' };
};

// Search events by location
const searchEventsByLocation = async (longitude, latitude, radius = 10, options = {}) => {
  const { page = 1, limit = 10, category } = options;
  
  // Build filter
  const filter = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(radius) * 1000, // Convert km to meters
      },
    },
  };
  
  // Add category filter
  if (category) {
    filter.categories = { $in: Array.isArray(category) ? category : [category] };
  }
  
  // Execute query with pagination
  const events = await Event.find(filter)
    .populate('organizer', 'name username')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: 1 });
  
  // Get total count
  const total = await Event.countDocuments(filter);
  
  return {
    events,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEventsByLocation,
};
