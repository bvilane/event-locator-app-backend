const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../../../src/models');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
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
    expect(savedUser.name).toBe(userData.name);
    // Password should be hashed
    expect(savedUser.password).not.toBe(userData.password);
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
    const plainPassword = 'password123';
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: plainPassword,
      name: 'Test User',
    });

    await user.save();

    // Check that password was hashed
    expect(user.password).not.toBe(plainPassword);
    
    // Verify hash works for comparison
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);
  });

  it('should compare password correctly', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await user.save();

    const isMatch = await user.comparePassword('password123');
    const isNotMatch = await user.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});