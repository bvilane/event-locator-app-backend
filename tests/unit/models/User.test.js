const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../../../src/models');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-locator-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      preferredCategories: ['music', 'sports'],
      preferredLanguage: 'en',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it('should require username, email, password, and name', async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should hash password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await user.save();

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    expect(user.password).toBe('hashedPassword');
  });

  it('should compare password correctly', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
    });

    const isMatch = await user.comparePassword('password123');

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(isMatch).toBe(true);
  });
});
