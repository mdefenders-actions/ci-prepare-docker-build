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
  const versionFile = core.getInput('version-file', { required: true })

  await fs.writeFile(versionFile, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  core.info(`${versionFile} updated: ${JSON.stringify(data)}`)

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
    await exec('git', ['add', versionFile])
    try {
      await exec('git', [
        'commit',
        '-m',
        `github-actions[bot] ${versionFile} updated with image version ${version}`
      ])
    } catch {
      core.info('No changes to commit')
    }
    try {
      await exec('git', ['push'])
    } catch {
      core.info('No changes to push')
    }
    core.info(`${versionFile} committed and pushed to git`)
  }
}
