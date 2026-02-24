module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  testTimeout: 20000,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
};
