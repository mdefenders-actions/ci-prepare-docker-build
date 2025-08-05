import { jest } from '@jest/globals'

export const getTags = jest.fn<typeof import('../src/getTags.js').getTags>()
