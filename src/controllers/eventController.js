const { validationResult } = require('express-validator');
const eventService = require('../services/eventService');

// Create a new event
const createEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await eventService.createEvent(req.body, req.user._id);
    res.status(201).json({
      message: req.t('events.created'),
      event,
    });
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get all events with filtering and pagination
const getEvents = async (req, res) => {
  try {
    const { page, limit, search, category, startDate, endDate } = req.query;
    
    const result = await eventService.getEvents({}, {
      page,
      limit,
      search,
      category,
      startDate,
      endDate,
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get events error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    console.error('Get event error:', error.message);
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: req.t('events.notFound') });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await eventService.updateEvent(req.params.id, req.body, req.user._id);
    res.status(200).json({
      message: req.t('events.updated'),
      event,
    });
  } catch (error) {
    console.error('Update event error:', error.message);
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: req.t('events.notFound') });
    }
    if (error.message === 'Not authorized to update this event') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user._id);
    res.status(200).json({ message: req.t('events.deleted') });
  } catch (error) {
    console.error('Delete event error:', error.message);
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: req.t('events.notFound') });
    }
    if (error.message === 'Not authorized to delete this event') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Search events by location
const searchEventsByLocation = async (req, res) => {
  try {
    const { longitude, latitude, radius, page, limit, category } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const result = await eventService.searchEventsByLocation(
      longitude,
      latitude,
      radius || process.env.DEFAULT_SEARCH_RADIUS,
      {
        page,
        limit,
        category,
      }
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Search events by location error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEventsByLocation,
};
