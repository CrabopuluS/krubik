module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/tests/styleMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};
