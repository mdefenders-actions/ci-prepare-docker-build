/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * Uses Jest ESM mocking to replace dependencies with fixtures.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { generateMarkDown } from '../__fixtures__/markDown.js'
import { getTags } from '../__fixtures__/getTags.js'
import { handleVersion } from '../__fixtures__/handleVersion.js'
import { TagsResult } from '../src/types.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/getTags.js', () => ({ getTags }))
jest.unstable_mockModule('../src/handleVersion.js', () => ({ handleVersion }))
jest.unstable_mockModule('../src/markDown.js', () => ({ generateMarkDown }))

const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock getTags to return a realistic TagsResult
    getTags.mockResolvedValue({
      allImages: 'repo/image',
      repo: 'repo/image',
      tag: 'v1.2.3',
      version: '1.2.3'
    } as unknown as TagsResult)
    // Mock handleVersion to resolve
    handleVersion.mockResolvedValue(undefined)
    // Mock generateMarkDown to return a markdown string
    generateMarkDown.mockResolvedValue('markdown-report')
  })

  it('sets all outputs and calls handleVersion', async () => {
    await run()
    expect(core.setOutput).toHaveBeenCalledWith('all-images', 'repo/image')
    expect(core.setOutput).toHaveBeenCalledWith('report', 'markdown-report')
    expect(core.setOutput).toHaveBeenCalledWith('new-tag', 'v1.2.3')
    expect(core.setOutput).toHaveBeenCalledWith('new-image', 'repo/image')
    expect(handleVersion).toHaveBeenCalledWith('1.2.3', 'v1.2.3')
  })

  it('sets a failed status on error', async () => {
    getTags.mockRejectedValueOnce(new Error('test error'))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('test error')
    expect(core.error).toHaveBeenCalledWith(
      'Action failed with error: test error'
    )
  })

  it('sets a failed status on unknown error', async () => {
    getTags.mockRejectedValueOnce('unknown error')
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
    expect(core.error).toHaveBeenCalledWith(
      'Action failed with an unknown error'
    )
  })
})
