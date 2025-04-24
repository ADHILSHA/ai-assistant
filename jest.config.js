module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-gfm|mdast-util-from-markdown|micromark|decode-named-character-reference|character-entities|mdast-util-to-string|unist-util-stringify-position|unist-util-visit|unist-util-visit-parents|unist-util-is|bail|unified|react-icons|space-separated-tokens|comma-separated-tokens|hast-util-whitespace|property-information|style-to-object|inline-style-parser|vfile|vfile-message|trough)/)',
  ],
}; 