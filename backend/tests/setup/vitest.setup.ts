// Backend test setup
// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Reset all mocks between tests
afterEach(() => {
  vi.restoreAllMocks();
});
