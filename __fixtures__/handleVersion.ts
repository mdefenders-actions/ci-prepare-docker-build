import { jest } from '@jest/globals'
export const handleVersion =
  jest.fn<typeof import('../src/handleVersion.js').handleVersion>()
