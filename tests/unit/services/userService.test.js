const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../../../src/models');
const userService = require('../../../src/services/userService');

describe('User Service', () => {
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
      expect(result.token).toBeDefined();

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
      // Create a user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      await user.save();

      const result = await userService.loginUser('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      await expect(userService.loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if password is incorrect', async () => {
      // Create a user
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await expect(userService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        preferredCategories: ['music'],
        preferredLanguage: 'en',
      });
      await user.save();

      const result = await userService.getUserProfile(user._id);

      expect(result._id.toString()).toBe(user._id.toString());
      expect(result.username).toBe(user.username);
      expect(result.email).toBe(user.email);
      expect(result.name).toBe(user.name);
      expect(result.preferredCategories).toEqual(user.preferredCategories);
      expect(result.preferredLanguage).toBe(user.preferredLanguage);
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(userService.getUserProfile(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      await user.save();

      const updates = {
        name: 'Updated Name',
        preferredCategories: ['sports', 'music'],
        preferredLanguage: 'fr',
      };

      const result = await userService.updateUserProfile(user._id, updates);

      expect(result.name).toBe(updates.name);
      expect(result.preferredCategories).toEqual(updates.preferredCategories);
      expect(result.preferredLanguage).toBe(updates.preferredLanguage);

      // Check that it was updated in the database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(updates.name);
    });

    it('should ignore password updates', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      await user.save();

      const originalPassword = user.password;

      const updates = {
        name: 'Updated Name',
        password: 'newpassword',
      };

      await userService.updateUserProfile(user._id, updates);

      // Check that the password was not updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.password).toBe(originalPassword);
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(userService.updateUserProfile(fakeId, { name: 'Updated' })).rejects.toThrow(
        'User not found'
      );
    });
  });
});