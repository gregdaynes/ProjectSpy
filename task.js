import { readFileSync, createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { join } from 'node:path'
import { marked } from 'marked'

export class Task {
  #contents = null

  constructor (filePath, metadata = {}) {
    this.filePath = filePath
    ;[this.title, this.markdownTitle] = this.#parseTitle(metadata.title, metadata.filename)
    this.description = metadata.description
    this.created = metadata.created
    this.modified = metadata.modified
    this.relativePath = metadata.relativePath
    this.filename = metadata.filename
    this.lane = metadata.lane
  }

  get titleHTML () {
    return marked.parse(this.title).trim()
  }

  get descriptionHTML () {
    return marked.parse(this.description).trim()
  }

  render () {
    if (!this.#contents) {
      this.#contents = readFileSync(this.filePath, 'utf8')
    }

    const modifiedFileContents = this.#contents.split('\n')

    modifiedFileContents[0] = this.markdownTitle
    if (modifiedFileContents[1].includes('--') || modifiedFileContents[1].includes('==')) {
      modifiedFileContents[1] = undefined
    }

    const content = marked.parse(modifiedFileContents.join('\n'))

    return content.trim()
  }

  rawContents () {
    if (!this.#contents) {
      this.#contents = readFileSync(this.filePath, 'utf8')
    }

    return this.#contents
  }

  #parseTitle (title, filename) {
    ;[title, this.manualOrder] = this.#getManualOrder(title)
    ;[title, this.priority] = this.#getPriority(title)
    ;[title, this.tags] = this.#getTags(title)

    if (!title) return [filename, '']

    return [title.split('\n')[0].replace('#', '').trim(), title.trim()]
  }

  #getManualOrder (title) {
    const manualOrderingRegex = /\((\d+)\)/g

    let order
    for (const match of title.matchAll(manualOrderingRegex)) {
      // parse the ordering
      const newOrder = Number(match[1])

      if (newOrder > order || !order) {
        order = newOrder
      }

      title = title.replace(match[0], '')
    }

    return [title, order]
  }

  #getPriority (title) {
    const priorityRegex = /(!+)/g

    let priority = 0
    for (const match of title.matchAll(priorityRegex)) {
      priority += match[1].length
      title = title.slice(0, match.index) + title.slice(match.index + match[0].length)
    }

    return [title, priority]
  }

  #getTags (title) {
    const tagsRegex = /\[([^\]]+)\]/g
    const tags = []

    for (const tag of title.matchAll(tagsRegex)) {
      tags.push(tag[1])

      title = title.replace(tag[0], '')
    }

    return [title, tags]
  }
}

export default async function TaskFactory (filePath, dirPath) {
  const [title, description] = await getHeader(filePath)
  const { birthtime: created, mtime: modified } = await stat(filePath)
  const relativePath = filePath.replace(join(dirPath, '/'), '')
  const [, lane, filename] = filePath.split(dirPath)[1].split('/')

  return new Task(join(process.cwd(), filePath), {
    filename,
    lane,
    title,
    description,
    created,
    modified,
    relativePath,
  })
}

async function getHeader (filePath) {
  const { promise, resolve, reject } = Promise.withResolvers()

  const fileStream = createReadStream(filePath)
  const rl = createInterface({ input: fileStream })
  let title = ''
  let description = ''
  let firstEmptyLineReached = false

  rl.on('line', (line) => {
    // done
    if (description) {
      return rl.close()
    }

    // empty line
    if (line === '') {
      firstEmptyLineReached = true
      return
    }

    if (firstEmptyLineReached === true) {
      description = line
      return
    }

    if (line.includes('#')) {
      title = line
      return
    }

    if (title) {
      if (line.includes('--')) {
        title = '## ' + title
        firstEmptyLineReached = true
        return
      }

      if (line.includes('==')) {
        title = '# ' + title
        firstEmptyLineReached = true
        return
      }
    }

    title = line
  })

  rl.on('close', () => {
    resolve([title, description])
  })

  rl.on('error', (err) => reject(err))

  return promise
}
