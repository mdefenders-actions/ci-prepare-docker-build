import { generateMarkDown } from '../src/markDown.js'
import { TagsResult } from '../src/types.js'

describe('generateMarkDown', () => {
  it('generates markdown for Docker image tags', async () => {
    const tagsRes: TagsResult = {
      allImages: 'myrepo/image',
      repo: 'myrepo/image',
      tag: 'v1.2.3',
      version: '1.2.3'
    }
    const result = await generateMarkDown(tagsRes)
    expect(result).toContain('### Image Repo:')
    expect(result).toContain('[myrepo/image]')
    expect(result).toContain(
      'https://hub.docker.com/repository/docker/myrepo/image/tags/'
    )
    expect(result).toContain('### Main Tag:')
    expect(result).toContain('[myrepo/image:v1.2.3]')
    expect(result).toContain(
      'https://hub.docker.com/r/myrepo/image/tags?name=v1.2.3'
    )
  })

  it('handles different tag values', async () => {
    const tagsRes: TagsResult = {
      allImages: 'anotherrepo/app',
      repo: 'anotherrepo/app',
      tag: 'latest',
      version: 'latest'
    }
    const result = await generateMarkDown(tagsRes)
    expect(result).toContain('[anotherrepo/app:latest]')
    expect(result).toContain(
      'https://hub.docker.com/r/anotherrepo/app/tags?name=latest'
    )
  })
})
