const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware');

const router = express.Router();

// Create a new event
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location.coordinates')
      .isArray()
      .withMessage('Location coordinates must be an array [longitude, latitude]'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('categories')
      .isArray({ min: 1 })
      .withMessage('At least one category is required'),
  ],
  eventController.createEvent
);

// Get all events with filtering and pagination
router.get('/', eventController.getEvents);

// Search events by location
router.get('/search/location', eventController.searchEventsByLocation);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Update event
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('location.coordinates')
      .optional()
      .isArray()
      .withMessage('Location coordinates must be an array [longitude, latitude]'),
    body('location.address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('categories')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one category is required'),
  ],
  eventController.updateEvent
);

// Delete event
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
