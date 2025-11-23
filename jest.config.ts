import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}

export default config
