import fs from 'node:fs/promises'
import { join, parse } from 'node:path'
import fp from 'fastify-plugin'
import { pathExists, makePath, prepareFilePath } from 'lib/utils.js'

const plugin = {
  name: 'file-system',
  dependencies: []
}

export default fp(async (fastify) => {
  fastify.decorate('v2create', async function ({
    lane, fileName, contents, changelogMessage
  }) {
    const filePath = buildPath(lane, fileName)

    return writePath(filePath, appendChangelog(
      contents,
      changelogMessage || 'Created task'
    ))
  })

  fastify.decorate('v2update', async function ({
    lane, fileName, newLane, newContents
  }) {
    const filePath = buildPath(lane, fileName)

    const existingContents = await fs.readFile(filePath, { encoding: 'utf-8' })

    const contents = (newContents.trim() !== existingContents.trim())
      ? appendChangelog(newContents, 'Updated task')
      : existingContents

    if (!newLane || lane === newLane) {
      return writePath(filePath, contents, true)
    }

    const results = await fastify.v2create({ lane: newLane, fileName, contents, changelogMessage: `Moved task to ${newLane}` })

    await deletePath(filePath)

    return results
  })

  fastify.decorate('v2delete', async function ({ lane, fileName }) {
    const filePath = buildPath(lane, fileName)

    return await deletePath(filePath)
  })

  fastify.decorate('v2archive', async function ({ lane, fileName }) {
    const filePath = buildPath(lane, fileName)
    const contents = await fs.readFile(filePath, { encoding: 'utf-8' })

    const { filePath: newFilePath } = await fastify.v2create({
      lane: '_archive',
      fileName,
      contents,
      changelogMessage: 'Archived task'
    })

    await deletePath(filePath)

    return { fileName, filePath: newFilePath }
  })

  async function deletePath (filePath) {
    const { promise, resolve } = Promise.withResolvers()

    const { dir, base } = parse(filePath)

    if (!await pathExists(filePath)) {
      return { fileName: base, filePath }
    }

    const lane = dir.replace(fastify.config.absolutePath + '/', '')

    fastify.eventBus().on(`task:delete:${lane}:${base}`, () => {
      return resolve({ fileName: base, filePath })
    })

    fs.unlink(filePath)

    return promise
  }

  async function writePath (filePath, contents, updateExisting = false) {
    const { promise, resolve } = Promise.withResolvers()

    const { dir, base } = parse(filePath)
    await makePath(dir)

    const lane = dir.replace(fastify.config.absolutePath + '/', '')

    const { fileName, filePath: newPath } = await prepareFilePath(buildPath(lane, base), updateExisting)

    fastify.eventBus().on(`task:change:${lane}:${fileName}`, () => {
      return resolve({ fileName, filePath: newPath })
    })

    fs.writeFile(newPath, contents)

    return promise
  }

  function buildPath (...path) {
    return join(fastify.config.absolutePath, ...path)
  }

  function appendChangelog (fileContents, message) {
    const logMessageMatcher = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/

    const hasLog = fileContents.trim()
      .split('\n')
      .at(-1)
      .match(logMessageMatcher)

    if (!hasLog) {
      fileContents += '\n\n---\n\n'
    }

    fileContents += `${new Date().toISOString().replace('T', ' ').slice(0, 16)}\t${message}\r\n`
    return fileContents
  }
}, plugin)
