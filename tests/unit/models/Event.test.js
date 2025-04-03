const mongoose = require('mongoose');
const { Event, User } = require('../../../src/models');

describe('Event Model', () => {
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

  it('should create a new event successfully', async () => {
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
      organizer: user._id,
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent._id).toBeDefined();
    expect(savedEvent.title).toBe(eventData.title);
    expect(savedEvent.description).toBe(eventData.description);
    expect(savedEvent.location.coordinates).toEqual(eventData.location.coordinates);
    expect(savedEvent.categories).toEqual(eventData.categories);
    expect(savedEvent.organizer.toString()).toBe(user._id.toString());
    expect(savedEvent.status).toBe('active');
  });

  it('should require title, description, location, date, categories, and organizer', async () => {
    const event = new Event({});

    let error;
    try {
      await event.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors['location.coordinates']).toBeDefined();
    expect(error.errors['location.address']).toBeDefined();
    expect(error.errors.date).toBeDefined();
    expect(error.errors.categories).toBeDefined();
    expect(error.errors.organizer).toBeDefined();
  });

  it('should have default status as active', async () => {
    const event = new Event({
      title: 'Test Event',
      description: 'This is a test event',
      location: {
        type: 'Point',
        coordinates: [-73.856077, 40.848447],
        address: '123 Test St, Test City',
      },
      date: new Date(),
      categories: ['music', 'arts'],
      organizer: user._id,
    });

    const savedEvent = await event.save();
    expect(savedEvent.status).toBe('active');
  });
});
