const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../../../src/models');
const userService = require('../../../src/services/userService');

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
}));

describe('User Service', () => {
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

  describe('registerUser', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await userService.registerUser(userData);

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe(userData.username);
      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBe('test-token');
      expect(jwt.sign).toHaveBeenCalled();

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
    });

    it('should throw error if user with email already exists', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      });

      // Try to register with same email
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        name: 'New User',
      };

      await expect(userService.registerUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('loginUser', () => {
    it('should login user and return token', async () => {
      // Create a user with a mocked compare password method
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      user.comparePassword = jest.fn().mockResolvedValue(true);
      await user.save();

      const result = await userService.loginUser('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('test-token');
      expect(jwt.sign).toHaveBeenCalled();
      expect(user.comparePassword).toHaveBeenCalledWith('password123');
    });

    it('should throw error if user not found', async () => {
      await expect(userService.loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if password is incorrect', async () => {
      // Create a user with a mocked compare password method that returns false
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      user.comparePassword = jest.fn().mockResolvedValue(false);
      await user.save();

      await expect(userService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  // Add more tests for getUserProfile and updateUserProfile
});
