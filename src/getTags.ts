import * as github from '@actions/github'
import * as core from '@actions/core'
import * as fs from 'fs/promises'
import { TagsResult } from './types.js'

export async function getTags(): Promise<TagsResult> {
  const result: TagsResult = {
    allImages: '',
    tag: '',
    repo: '',
    version: 'SNAPSHOT'
  }

  const versionFile = core.getInput('version-file', { required: true })
  const trunkBranch = core.getInput('trunk-branch', { required: true })

  let tagSuffix
  let branchName
  let data
  let version = core.getInput('default-trunk-version', { required: true })
  const fullRepoName = `${github.context.repo.owner
    .toLowerCase()
    .replace(/[^a-z0-9_.\-/]/g, '-')}/${github.context.repo.repo
    .toLowerCase()
    .replace(/[^a-z0-9_.\-/]/g, '-')}`

  if (github.context.eventName === 'pull_request') {
    tagSuffix =
      'pr-' +
      (github.context.payload.pull_request?.number?.toString() ||
        'unknown-pr-number')
    branchName = process.env.GITHUB_HEAD_REF || 'unknown-branch-name'
    core.info(`Detected Pull Request ${tagSuffix} to ${branchName}`)
  } else {
    tagSuffix = github.context.sha.slice(0, 7)
    branchName = process.env.GITHUB_REF_NAME || 'unknown-branch-name'
    core.info(`Detected branch/tag name: ${branchName}`)
  }
  // Sanitize branchName for Docker image tag
  const tagPrefix = branchName
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-') // Replace invalid chars with dash
    .replace(/^[.-]+|[.-]+$/g, '') // Remove leading/trailing . or -
    .replace(/[-.]{2,}/g, '-') // Replace consecutive . or - with single dash
    .slice(0, 128) // Limit length

  // check if a correct version file exists on trunk branch only
  // and requires updates
  if (
    branchName === trunkBranch ||
    github.context.eventName === 'pull_request'
  ) {
    data = JSON.parse(await fs.readFile(versionFile, 'utf-8'))
    if (
      typeof data.version !== 'string' ||
      !/^\d+\.\d+\.\d+$/.test(data.version)
    ) {
      throw new Error(
        `Invalid or missing version in ${versionFile}: must be a valid semver string (e.g., 1.2.3)`
      )
    }
  }
  if (branchName === trunkBranch) {
    core.info(`Detected trunk branch: ${trunkBranch}`)
    const [major, minor, patch] = data.version.split('.').map(Number)
    version = `${major}.${minor}.${patch + 1}`
    result.allImages = `${fullRepoName}:${version},${fullRepoName}:latest,${fullRepoName}:${tagSuffix}`
    result.tag = version
    result.version = version
  } else {
    result.allImages = `${fullRepoName}:${tagPrefix}-latest,${fullRepoName}:${tagPrefix}-${tagSuffix}`
    result.tag = `${tagPrefix}-${tagSuffix}`
    result.version = 'SNAPSHOT'
  }
  result.repo = fullRepoName
  return result
}
