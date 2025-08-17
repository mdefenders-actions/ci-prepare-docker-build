import { jest } from '@jest/globals'

export const generateMarkDown =
  jest.fn<typeof import('../src/markDown.js').generateMarkDown>()
