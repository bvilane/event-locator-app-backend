const mongoose = require('mongoose');
const { Event, User } = require('../../../src/models');
const eventService = require('../../../src/services/eventService');

describe('Event Service', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-locator-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    user = new User({
      username: 'organizer',
      email: 'organizer@example.com',
      password: 'password123',
      name: 'Event Organizer',
    });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['music', 'arts'],
      };

      const event = await eventService.createEvent(eventData, user._id);

      expect(event._id).toBeDefined();
      expect(event.title).toBe(eventData.title);
      expect(event.description).toBe(eventData.description);
      expect(event.organizer.toString()).toBe(user._id.toString());

      // Verify event was saved to database
      const savedEvent = await Event.findById(event._id);
      expect(savedEvent).toBeDefined();
      expect(savedEvent.title).toBe(eventData.title);
    });
  });

  describe('getEvents', () => {
    beforeEach(async () => {
      // Create some test events
      const events = [
        {
          title: 'Music Festival',
          description: 'A music festival',
          location: {
            type: 'Point',
            coordinates: [-73.856077, 40.848447],
            address: '123 Music St, Test City',
          },
          date: new Date('2023-06-15'),
          categories: ['music'],
          organizer: user._id,
        },
        {
          title: 'Art Exhibition',
          description: 'An art exhibition',
          location: {
            type: 'Point',
            coordinates: [-73.856077, 40.848447],
            address: '456 Art St, Test City',
          },
          date: new Date('2023-07-20'),
          categories: ['arts'],
          organizer: user._id,
        },
        {
          title: 'Sports Event',
          description: 'A sports event',
          location: {
            type: 'Point',
            coordinates: [-73.856077, 40.848447],
            address: '789 Sports St, Test City',
          },
          date: new Date('2023-08-10'),
          categories: ['sports'],
          organizer: user._id,
        },
      ];

      await Event.insertMany(events);
    });

    it('should get all events with pagination', async () => {
      const result = await eventService.getEvents({}, { page: 1, limit: 2 });

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.total).toBe(3);
    });

    it('should filter events by category', async () => {
      const result = await eventService.getEvents({}, { category: 'music' });

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(1);
      expect(result.events[0].title).toBe('Music Festival');
    });

    it('should filter events by date range', async () => {
      const result = await eventService.getEvents({}, {
        startDate: '2023-07-01',
        endDate: '2023-08-01',
      });

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(1);
      expect(result.events[0].title).toBe('Art Exhibition');
    });
  });

  // Add more tests for getEventById, updateEvent, deleteEvent, and searchEventsByLocation
});
