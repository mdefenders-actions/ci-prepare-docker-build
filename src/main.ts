import * as core from '@actions/core'
import { generateMarkDown } from './markDown.js'
import { getTags } from './getTags.js'
import { TagsResult } from './types.js'
import { handleVersion } from './handleVersion.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.startGroup('Getting Image tags')
    const result: TagsResult = await getTags()
    core.endGroup()

    core.startGroup('Update version.json')
    await handleVersion(result.version, result.tag)
    core.endGroup()

    core.startGroup('Generating Markdown Report')

    const markDownReport = await generateMarkDown(result)
    await core.summary.addRaw(markDownReport, true).write()
    core.setOutput('all-images', result.allImages)
    core.setOutput('report', markDownReport)
    core.setOutput('new-tag', result.tag)
    core.setOutput('new-image', result.repo)
    core.endGroup()
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(`Action failed with error: ${error.message}`)
      core.setFailed(error.message)
    } else {
      core.error('Action failed with an unknown error')
      core.setFailed('Unknown error occurred')
    }
  }
}
