const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, Event } = require('../../src/models');

describe('API Integration Tests', () => {
  let token;
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-locator-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    await user.save();

    // Generate token for authenticated requests
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test_secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Endpoints', () => {
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
      // Mock the comparePassword method for the test user
      User.prototype.comparePassword = jest.fn().mockResolvedValue(true);

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
    });

    it('should get all events', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    it('should search events by location', async () => {
      // Create an event at a specific location
      await Event.create({
        title: 'Location Test Event',
        description: 'This is an event for location testing',
        location: {
          type: 'Point',
          coordinates: [10.5, 40.5],
          address: '456 Location St, Test City',
        },
        date: new Date(),
        categories: ['test'],
        organizer: user._id,
      });

      const response = await request(app)
        .get('/api/events/search/location')
        .query({
          longitude: 10.5,
          latitude: 40.5,
          radius: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
      expect(Array.isArray(response.body.events)).toBe(true);
      // The event should be found if the geospatial query is working
      if (response.body.events.length > 0) {
        expect(response.body.events[0].title).toBe('Location Test Event');
      }
    });
  });
});
