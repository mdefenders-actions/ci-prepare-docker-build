import * as fs from 'fs/promises'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from '@actions/exec'

export async function handleVersion(
  version: string,
  tag: string
): Promise<void> {
  const commit = github.context.sha.slice(0, 8)
  const data = {
    version,
    tag,
    commit
  }
  await fs.writeFile(
    'version.json',
    JSON.stringify(data, null, 2) + '\n',
    'utf-8'
  )
  core.info(`version.json updated: ${JSON.stringify(data)}`)

  // If version is not SNAPSHOT, commit the change using @actions/exec
  if (version !== 'SNAPSHOT') {
    // Check if version is valid SemVer before committing
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(
        `Version '${version}' is not valid SemVer. Aborting git commit.`
      )
    }
    await exec('git', [
      'config',
      '--global',
      'user.name',
      'github-actions[bot]'
    ])
    await exec('git', [
      'config',
      '--global',
      'user.email',
      'github-actions[bot]@users.noreply.github.com'
    ])
    await exec('git', ['add', 'version.json'])
    try {
      await exec('git', [
        'commit',
        '-m',
        `github-actions[bot] version.json updated with image version ${version}`
      ])
    } catch {
      core.info('No changes to commit')
    }
    try {
      await exec('git', ['push'])
    } catch {
      core.info('No changes to push')
    }
    core.info('version.json committed and pushed to git')
  }
}
