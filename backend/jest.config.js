module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html'],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Tubulu Backend API Test Report',
      outputPath: './test-report.html',
      includeFailureMsg: true,
    }]
  ],
  testTimeout: 10000,
};
