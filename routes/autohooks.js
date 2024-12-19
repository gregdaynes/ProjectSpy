import fs from 'node:fs/promises'
import { join } from 'node:path'

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

  fastify.decorate('writeFile', async ({ lane, filePath, filename, contents }) => {
    const { promise, resolve, reject } = Promise.withResolvers()

    fastify.eventBus().on(`task:add:${lane}:${filename}`, () => {
      resolve()
    })

    await fs.writeFile(filePath, contents)

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
}

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
