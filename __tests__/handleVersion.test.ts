import { jest } from '@jest/globals'
import * as fs from '../__fixtures__/fs.js'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import { exec } from '../__fixtures__/exec.js'

jest.unstable_mockModule('fs/promises', () => fs)
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('@actions/exec', () => ({ exec }))

const { handleVersion } = await import('../src/handleVersion.js')

describe('handleVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    github.context.sha = 'abcdef1234567890'
  })

  it('writes correct version.json and logs update', async () => {
    await handleVersion('1.2.3', '1.2.3-tag')
    expect(fs.writeFile).toHaveBeenCalledWith(
      'version.json',
      expect.stringContaining('"version": "1.2.3"'),
      'utf-8'
    )
    expect(core.info).toHaveBeenCalledWith(
      expect.stringContaining('version.json updated:')
    )
  })

  it('does not run git commands for SNAPSHOT version', async () => {
    await handleVersion('SNAPSHOT', 'snapshot-tag')
    expect(exec).not.toHaveBeenCalledWith('git', expect.anything())
  })

  it('runs git commands for valid SemVer version', async () => {
    await handleVersion('1.2.3', '1.2.3-tag')
    expect(exec).toHaveBeenCalledWith('git', [
      'config',
      '--global',
      'user.name',
      'github-actions[bot]'
    ])
    expect(exec).toHaveBeenCalledWith('git', [
      'config',
      '--global',
      'user.email',
      'github-actions[bot]@users.noreply.github.com'
    ])
    expect(exec).toHaveBeenCalledWith('git', ['add', 'version.json'])
    expect(exec).toHaveBeenCalledWith('git', [
      'commit',
      '-m',
      expect.stringContaining('version.json updated with image version 1.2.3')
    ])
    expect(exec).toHaveBeenCalledWith('git', ['push'])
    expect(core.info).toHaveBeenCalledWith(
      'version.json committed and pushed to git'
    )
  })

  it('throws error for invalid SemVer version', async () => {
    await expect(handleVersion('not-semver', 'tag')).rejects.toThrow(
      /not valid SemVer/
    )
    expect(exec).not.toHaveBeenCalled()
  })

  it('logs info if git commit has no changes', async () => {
    for (let i = 0; i < 3; i++) {
      exec.mockImplementationOnce((_cmd, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from('test output'))
        return Promise.resolve(0)
      })
    }

    exec.mockImplementationOnce(() => {
      throw new Error('No changes to commit')
    })

    exec.mockImplementationOnce((_cmd, _args, options) => {
      options?.listeners?.stdout?.(Buffer.from('test output'))
      return Promise.resolve(0)
    })

    await handleVersion('1.2.3', '1.2.3-tag')
    expect(core.info).toHaveBeenCalledWith('No changes to commit')
  })

  it('logs info if git push has no changes', async () => {
    for (let i = 0; i < 4; i++) {
      exec.mockImplementationOnce((_cmd, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from('test output'))
        return Promise.resolve(0)
      })
    }

    exec.mockImplementationOnce(() => {
      throw new Error('No changes to push')
    })

    await handleVersion('1.2.3', '1.2.3-tag')
    expect(core.info).toHaveBeenCalledWith('No changes to push')
  })

  it('uses first 8 chars of commit SHA', async () => {
    github.context.sha = '1234567890abcdef'
    await handleVersion('1.2.3', '1.2.3-tag')
    expect(fs.writeFile).toHaveBeenCalledWith(
      'version.json',
      expect.stringContaining('"commit": "12345678"'),
      'utf-8'
    )
  })
})
