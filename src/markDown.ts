import { TagsResult } from './types.js'

export async function generateMarkDown(tagsRes: TagsResult): Promise<string> {
  let markDown = `### Image Repo:\n\n`
  markDown += `[${tagsRes.allImages}](https://hub.docker.com/repository/docker/${tagsRes.repo}/tags/)\n\n`
  markDown += `### Main Tag:\n\n`
  markDown += `[${tagsRes.repo}:${tagsRes.tag}](https://hub.docker.com/r/${tagsRes.repo}/tags?name=${tagsRes.tag})\n\n`
  return markDown
}
