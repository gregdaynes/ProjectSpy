import fs from 'node:fs/promises'
import fp from 'fastify-plugin'
import { pathExists } from 'lib/utils.js'
import { join } from 'node:path'

const plugin = {
  name: 'file-system',
  dependencies: []
}

export default fp(async (fastify) => {
  fastify.decorate('deleteFile', async ({ lane, filename, filePath }) => {
    const { promise, resolve, reject } = Promise.withResolvers()

    fastify.eventBus().on(`task:delete:${lane}:${filename}`, () => {
      resolve()
    })

    try {
      await fs.unlink(filePath)
    } catch (err) {
      fastify.log.error({ lane, filePath, filename }, 'Attempted to delete file')
      return reject(err)
    }

    return promise
  })

  fastify.decorate('changeFile', async ({ lane, filePath, filename, contents }) => {
    const { promise, resolve, reject } = Promise.withResolvers()

    fastify.eventBus().on(`task:change:${lane}:${filename}`, async () => {
      resolve()
    })

    try {
      if (!fastify.config.laneKeys.includes(lane)) {
        return reject('Lane invalid')
      }

      const lanePath = join(fastify.config.absolutePath, lane)
      if (!await pathExists(lanePath)) {
        await fs.mkdir(lanePath, { recursive: true })

        fastify.log.debug({ lanePath }, 'Created lane directory')
      }

      await fs.writeFile(filePath, contents)
    } catch (err) {
      fastify.log.error({ lane, filePath, filename }, 'Attempted to write file')
      return reject(err)
    }

    return promise
  })

  fastify.decorate('logToTask', (fileContents, message) => {
    const logMessageMatcher = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/

    const hasLog = fileContents.trim()
      .split('\n')
      .at(-1)
      .match(logMessageMatcher)

    if (!hasLog) {
      fileContents += '\n\n---\n\n'
    }

    fileContents += `${new Date().toISOString().replace('T', ' ').slice(0, 16)}\t${message}\n`
    return fileContents
  })
}, plugin)
