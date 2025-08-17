import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import * as fs from '../__fixtures__/fs.js'

const validVersionData = JSON.stringify({ version: '1.2.3' })
const invalidVersionData = JSON.stringify({ version: 'not-semver' })
const missingVersionData = JSON.stringify({})

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('fs/promises', () => fs)

const { getTags } = await import('../src/getTags.js')

// Helper to set up GitHub context for trunk branch
function setupTrunkBranch() {
  github.context.repo = { owner: 'owner', repo: 'repo' }
  github.context.eventName = 'push'
  github.context.sha = 'abcdef1234567890'
  process.env.GITHUB_REF_NAME = 'main'
}

// Helper to set up GitHub context for PR
function setupPR() {
  github.context.repo = { owner: 'owner', repo: 'repo' }
  github.context.eventName = 'pull_request'
  github.context.payload = { pull_request: { number: 42 } }
  process.env.GITHUB_HEAD_REF = 'feature/test'
}

describe('getTags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    core.getInput.mockImplementation((key) => {
      if (key === 'version-file') return 'version.json'
      if (key === 'trunk-branch') return 'main'
      if (key === 'default-trunk-version') return '1.2.3'
      return ''
    })
  })

  it('returns correct tags for trunk branch with valid version', async () => {
    setupTrunkBranch()
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    expect(result.version).toBe('1.2.4')
    expect(result.tag).toBe('1.2.4')
    expect(result.repo).toBe('owner/repo')
    expect(result.allImages).toContain('owner/repo:1.2.4')
    expect(result.allImages).toContain('owner/repo:latest')
  })

  it('throws if version file is missing', async () => {
    setupTrunkBranch()
    fs.readFile.mockRejectedValue(new Error('File not found'))
    await expect(getTags()).rejects.toThrow('File not found')
  })

  it('throws if version is missing', async () => {
    setupTrunkBranch()
    fs.readFile.mockResolvedValue(missingVersionData)
    await expect(getTags()).rejects.toThrow(/Invalid or missing version/)
  })

  it('throws if version is not semver', async () => {
    setupTrunkBranch()
    fs.readFile.mockResolvedValue(invalidVersionData)
    await expect(getTags()).rejects.toThrow(/Invalid or missing version/)
  })

  it('returns correct tags for pull request', async () => {
    setupPR()
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    expect(result.version).toBe('SNAPSHOT')
    expect(result.tag).toBe('feature-test-pr-42')
    expect(result.repo).toBe('owner/repo')
    expect(result.allImages).toContain('owner/repo:')
  })

  it('handles PR event with missing PR number', async () => {
    github.context.repo = { owner: 'owner', repo: 'repo' }
    github.context.eventName = 'pull_request'
    github.context.payload = { pull_request: {} }
    process.env.GITHUB_HEAD_REF = 'feature/test'
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    expect(result.tag).toMatch(/unknown-pr-number/)
  })

  it('handles PR event with missing branch name', async () => {
    github.context.repo = { owner: 'owner', repo: 'repo' }
    github.context.eventName = 'pull_request'
    github.context.payload = { pull_request: { number: 42 } }
    delete process.env.GITHUB_HEAD_REF
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    expect(result.tag).toMatch(/unknown-branch-name/)
    expect(result.allImages).toMatch(/unknown-branch-name/)
  })

  it('handles non-PR event with missing branch name', async () => {
    github.context.repo = { owner: 'owner', repo: 'repo' }
    github.context.eventName = 'push'
    github.context.sha = 'abcdef1234567890'
    delete process.env.GITHUB_REF_NAME
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    expect(result.tag).toMatch(/unknown-branch-name/)
    expect(result.allImages).toMatch(/unknown-branch-name/)
  })

  it('sanitizes branch names for Docker tags', async () => {
    github.context.repo = { owner: 'owner', repo: 'repo' }
    github.context.eventName = 'push'
    github.context.sha = 'abcdef1234567890'
    process.env.GITHUB_REF_NAME = '!!!___...my--branch--name...___!!!'.repeat(
      10
    )
    fs.readFile.mockResolvedValue(validVersionData)
    const result = await getTags()
    // Should be lowercased, special chars replaced, trimmed, and length <= 128
    expect(result.tag.length).toBeLessThanOrEqual(128 + 1 + 7) // tagPrefix + '-' + tagSuffix
    expect(result.tag).not.toMatch(/[^a-z0-9_.-]/)
  })
})
