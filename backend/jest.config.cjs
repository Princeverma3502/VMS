module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  testTimeout: 20000,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Allow transforming uuid package (ESM syntax) so Jest can run it in tests
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
};
