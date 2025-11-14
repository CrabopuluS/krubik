module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/tests/styleMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};
