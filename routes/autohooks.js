import fs from 'node:fs/promises'
import { join } from 'node:path'
import slugify from 'slugify'
import { promisify } from 'node:util'
import ChildProcess from 'node:child_process'

const exec = promisify(ChildProcess.exec)

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
      const tasks = [...request.taskList().get(slug)]
        .map(task => request.buildTask(task[1]))
        .sort((a, b) => b.priority - a.priority)

      const lane = {
        name,
        slug,
        tasks,
        count: tasks.length,
      }

      reply.locals.taskLanes.push(lane)
      reply.locals.searchObject = JSON.stringify(buildSearchObject(request.taskList()), null, 2)
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

    fastify.eventBus().on(`task:change:${lane}:${filename}`, async () => {
      resolve()
    })

    fs.writeFile(filePath, contents)

    return promise
  })

  fastify.decorate('commit', async (paths, message) => {
    if (!Array.isArray(paths)) paths = [paths]

    for (const path of paths) {
      try {
        await exec(`git add ${path}`)
      } catch (err) {
        if (err.stderr !== '') {
          fastify.log.error({ err, path, message }, 'add  file')
          throw new Error(err)
        }
      }
    }

    try {
      await exec(`git commit -m "project: ${message}"`)
    } catch (err) {
      if (err.stderr !== '') {
        fastify.log.error({ err, paths, message }, 'Commit file')
        throw new Error(err)
      }
    }
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

  fastify.addHook('onRequest', async (request, reply) => {
    request.commit = fastify.commit
  })
}

/**
 *
 * @param task
 */
function buildTask (task) {

  return {
    relativePath: task.relativePath,

    id: `${task.lane}-${task.filename}`,
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

function buildSearchObject(taskList) {
  const searchObject = []


  for (const [lane, tasks] of taskList) {
    for (const [filename, task] of tasks) {
      const text = `${task.title} ${task.description}`.toLowerCase()

      searchObject.push([
        text,
        slugify(`${lane}-${filename}`)
      ])
    }
  }

  return searchObject
}
