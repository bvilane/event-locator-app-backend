process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jwt';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGODB_URI = 'mongodb://localhost:27017/event-locator-test';
process.env.DEFAULT_SEARCH_RADIUS = '10';