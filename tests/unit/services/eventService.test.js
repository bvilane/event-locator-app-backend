const mongoose = require('mongoose');
const { Event, User } = require('../../../src/models');
const eventService = require('../../../src/services/eventService');

describe('Event Service', () => {
  let user;
  let otherUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test users
    user = new User({
      username: 'organizer',
      email: 'organizer@example.com',
      password: 'password123',
      name: 'Event Organizer',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });
    await user.save();

    otherUser = new User({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123',
      name: 'Other User',
      location: {
        type: 'Point',
        coordinates: [1, 1],
      },
    });
    await otherUser.save();
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

    it('should search events by text', async () => {
      // Note: This test might be flaky because text search depends on MongoDB's text index
      const result = await eventService.getEvents({}, { search: 'music' });

      expect(result.events).toBeDefined();
      // We expect at least the Music Festival to be returned
      const musicEvent = result.events.find(e => e.title === 'Music Festival');
      expect(musicEvent).toBeDefined();
    });
  });

  describe('getEventById', () => {
    it('should get event by ID', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });
      await event.save();

      const result = await eventService.getEventById(event._id);

      expect(result._id.toString()).toBe(event._id.toString());
      expect(result.title).toBe(event.title);
      expect(result.organizer._id.toString()).toBe(user._id.toString());
    });

    it('should throw error if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(eventService.getEventById(fakeId)).rejects.toThrow('Event not found');
    });
  });

  describe('updateEvent', () => {
    it('should update event if user is the organizer', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });
      await event.save();

      const updates = {
        title: 'Updated Event',
        description: 'This is an updated event',
      };

      const result = await eventService.updateEvent(event._id, updates, user._id);

      expect(result.title).toBe(updates.title);
      expect(result.description).toBe(updates.description);

      // Check that it was updated in the database
      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.title).toBe(updates.title);
    });

    it('should throw error if user is not the organizer', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });
      await event.save();

      await expect(eventService.updateEvent(event._id, { title: 'Updated' }, otherUser._id)).rejects.toThrow(
        'Not authorized to update this event'
      );
    });

    it('should throw error if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(eventService.updateEvent(fakeId, { title: 'Updated' }, user._id)).rejects.toThrow(
        'Event not found'
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete event if user is the organizer', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });
      await event.save();

      await eventService.deleteEvent(event._id, user._id);

      // Check that it was deleted from the database
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should throw error if user is not the organizer', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [-73.856077, 40.848447],
          address: '123 Test St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });
      await event.save();

      await expect(eventService.deleteEvent(event._id, otherUser._id)).rejects.toThrow(
        'Not authorized to delete this event'
      );
    });

    it('should throw error if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(eventService.deleteEvent(fakeId, user._id)).rejects.toThrow(
        'Event not found'
      );
    });
  });

  describe('searchEventsByLocation', () => {
    beforeEach(async () => {
      // Create events at different locations
      await Event.insertMany([
        {
          title: 'Nearby Event',
          description: 'An event nearby',
          location: {
            type: 'Point',
            coordinates: [0.01, 0.01], // Very close to user location [0, 0]
            address: '123 Nearby St, Test City',
          },
          date: new Date(),
          categories: ['test'],
          organizer: user._id,
        },
        {
          title: 'Far Event',
          description: 'An event far away',
          location: {
            type: 'Point',
            coordinates: [10, 10], // Far from user location [0, 0]
            address: '456 Far St, Test City',
          },
          date: new Date(),
          categories: ['test'],
          organizer: user._id,
        },
        {
          title: 'Music Event',
          description: 'A music event nearby',
          location: {
            type: 'Point',
            coordinates: [0.02, 0.02], // Close to user location [0, 0]
            address: '789 Music St, Test City',
          },
          date: new Date(),
          categories: ['music'],
          organizer: user._id,
        },
      ]);
    });

    it('should find events within radius', async () => {
      // Search for events near [0, 0] within 5km
      const result = await eventService.searchEventsByLocation(0, 0, 5);

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(2); // Should find the 2 nearby events
      
      const titles = result.events.map(e => e.title);
      expect(titles).toContain('Nearby Event');
      expect(titles).toContain('Music Event');
      expect(titles).not.toContain('Far Event');
    });

    it('should filter events by category', async () => {
      // Search for music events near [0, 0] within 5km
      const result = await eventService.searchEventsByLocation(0, 0, 5, { category: 'music' });

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(1);
      expect(result.events[0].title).toBe('Music Event');
    });

    it('should paginate results', async () => {
      // Search with small limit to test pagination
      const result = await eventService.searchEventsByLocation(0, 0, 5, { limit: 1, page: 1 });

      expect(result.events).toBeDefined();
      expect(result.events.length).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.total).toBe(2);
    });
  });
});