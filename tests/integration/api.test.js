const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, Event } = require('../../src/models');

describe('API Integration Tests', () => {
  let token;
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });
    await user.save();

    // Generate token for authenticated requests
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  describe('User Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should login a user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          preferredCategories: ['music', 'sports'],
          preferredLanguage: 'fr',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.preferredCategories).toEqual(['music', 'sports']);
      expect(response.body.user.preferredLanguage).toBe('fr');
    });
  });

  describe('Event Endpoints', () => {
    it('should create a new event', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Event',
          description: 'This is a test event',
          location: {
            coordinates: [-73.856077, 40.848447],
            address: '123 Test St, Test City',
          },
          date: new Date().toISOString(),
          categories: ['test'],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.event).toBeDefined();
      expect(response.body.event.title).toBe('Test Event');
      expect(response.body.event.organizer.toString()).toBe(user._id.toString());
    });

    it('should get all events', async () => {
      // Create a few events first
      await Event.create([
        {
          title: 'Event 1',
          description: 'Description 1',
          location: {
            type: 'Point',
            coordinates: [0, 0],
            address: 'Address 1',
          },
          date: new Date(),
          categories: ['test'],
          organizer: user._id,
        },
        {
          title: 'Event 2',
          description: 'Description 2',
          location: {
            type: 'Point',
            coordinates: [1, 1],
            address: 'Address 2',
          },
          date: new Date(),
          categories: ['music'],
          organizer: user._id,
        },
      ]);

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBe(2);
    });

    it('should get an event by ID', async () => {
      const event = await Event.create({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Address',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });

      const response = await request(app).get(`/api/events/${event._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(event._id.toString());
      expect(response.body.title).toBe(event.title);
    });

    it('should update an event', async () => {
      const event = await Event.create({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Address',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Event',
          description: 'This is an updated test event',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.event.title).toBe('Updated Event');
      expect(response.body.event.description).toBe('This is an updated test event');
    });

    it('should delete an event', async () => {
      const event = await Event.create({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Address',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });

      const response = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();

      // Verify event was deleted
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should search events by location', async () => {
      // Create events at different locations
      await Event.create([
        {
          title: 'Nearby Event',
          description: 'An event nearby',
          location: {
            type: 'Point',
            coordinates: [0.01, 0.01], // Close to search point [0, 0]
            address: 'Nearby Address',
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
            coordinates: [10, 10], // Far from search point [0, 0]
            address: 'Far Address',
          },
          date: new Date(),
          categories: ['test'],
          organizer: user._id,
        },
      ]);

      const response = await request(app)
        .get('/api/events/search/location')
        .query({
          longitude: 0,
          latitude: 0,
          radius: 5, // 5km radius
        });

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].title).toBe('Nearby Event');
    });
  });

  describe('Notification Endpoints', () => {
    it('should queue a notification for an event', async () => {
      // Create an event
      const event = await Event.create({
        title: 'Test Event',
        description: 'This is a test event',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Address',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });

      const response = await request(app)
        .post(`/api/notifications/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      // This test might be flaky if Redis is not available,
      // but we should still get a 200 response due to our fallback mechanism
      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should queue notifications for upcoming events', async () => {
      // Create some upcoming events
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Event.create([
        {
          title: 'Tomorrow\'s Event',
          description: 'An event tomorrow',
          location: {
            type: 'Point',
            coordinates: [0, 0],
            address: 'Address',
          },
          date: tomorrow,
          categories: ['test'],
          organizer: user._id,
        },
      ]);

      const response = await request(app)
        .post('/api/notifications/upcoming')
        .set('Authorization', `Bearer ${token}`)
        .query({ daysAhead: 2 });

      // Again, this test might be flaky if Redis is not available
      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.count).toBe(1);
    });
  });
});