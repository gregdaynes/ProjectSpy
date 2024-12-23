import fs from 'node:fs/promises'
import { join } from 'node:path'

/**
 *
 * @param fastify
 * @param opts
 */
export default function (fastify, opts) {
  fastify.decorate('preHandlerParams', async (request, reply) => {
    const { lane, filename } = request.params

    const safeName = filename.replace('/', '_')
    const filePath = join(request.config.dirPath, lane, safeName)

    request.ctx = {
      ...request.ctx,
      lane,
      filename,
      filePath
    }
  })

  fastify.decorate('preHandlerTask', async (request, reply) => {
    const { lane, filename } = request.ctx
    const task = request.taskList().get(lane).get(filename)

    if (task === undefined) {
      return reply.redirect('/')
    }

    request.ctx = {
      ...request.ctx,
      task,
      builtTask: buildTask(task)
    }
  })

  fastify.decorate('preHandlerTaskLanes', async (request, reply) => {
    reply.locals.taskLanes = []

    for (const [slug, name] of request.config.lanes) {
      const lane = {
        name,
        slug,
        tasks: [...request.taskList().get(slug)].map(task => request.buildTask(task[1]))
      }

      reply.locals.taskLanes.push(lane)
    }
  })

  fastify.decorate('deleteFile', async ({ lane, filename, filePath }) => {
    const { promise, resolve, reject } = Promise.withResolvers()

    fastify.eventBus().on(`task:delete:${lane}:${filename}`, () => {
      resolve()
    })

    await fs.unlink(filePath)

    return promise
  })

  fastify.decorate('changeFile', async ({ lane, filePath, filename, contents }) => {
    const { promise, resolve, reject } = Promise.withResolvers()

    fastify.eventBus().on(`task:change:${lane}:${filename}`, () => {
      resolve()
    })

    fs.writeFile(filePath, contents)

    return promise
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.taskList = fastify.taskList
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.buildTask = buildTask
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.config = fastify.config
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.eventBus = request.server.eventBus()
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.logToTask = logToTask
  })
}

/**
 *
 * @param task
 */
function buildTask (task) {
  return {
    relativePath: task.relativePath,

    title: task.title,
    descriptionHTML: task.descriptionHTML,
    tags: task.tags || [],
    priority: task.priority,
    actions: {
      view: `/view/${task.relativePath}`,
    },
  }
}

function logToTask (fileContents, message) {
  const logMessageMatcher = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/

  const hasLog = fileContents.trim()
    .split('\n')
    .at(-1)
    .match(logMessageMatcher)

  if (!hasLog) {
    fileContents += `\n\n---\n\n`
  }

  fileContents += `${new Date().toISOString().replace('T', ' ').slice(0, 16)}\t${message}\n`
  return fileContents
}
