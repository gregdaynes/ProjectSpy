import fs from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import fp from 'fastify-plugin'
import { watch } from 'node:fs/promises'
import TaskFactory from '../task.js'
import firstBy from 'thenby'

export default fp(
  async function (fastify) {
    let sharedTaskLanes = Promise.withResolvers()

    const abortController = new AbortController()
    const { signal } = abortController
    const watcher = watch(path.join(process.cwd(), fastify.config.dirPath), { recursive: true, signal })

    ;(async () => {
      for await (const { filename } of watcher) {
        const lanes = fastify.config.lanes.map(([lane]) => lane)
        if (!lanes.includes(filename.split('/')[0])) {
          continue
        }

        if (!sharedTaskLanes.promise) {
          sharedTaskLanes = Promise.withResolvers()
        }

        fastify.log.info('File changed: %s', filename)
        fastify.updateFileTree()
      }
    })()

    fastify.addHook('onReady', async function () {
      await fastify.updateFileTree()
    })

    fastify.addHook('preHandler', async function (request, reply) {
      reply.locals = Object.assign({}, reply.locals, {
        taskLanes: await sharedTaskLanes.promise,
      })
    })

    fastify.addHook('onClose', function () {
      abortController.abort()
    })

    fastify.decorate('futureTaskUpdate', async function () {
      sharedTaskLanes = Promise.withResolvers()

      return sharedTaskLanes.promise
    })

    fastify.decorate('updateFileTree', async function () {
      const files = fastify.listFiles()
      const tasks = await fastify.assembleTasks(files)
      const groupedTasks = fastify.tasksToTree(tasks)
      const sortedGroupedTasks = Object.entries(groupedTasks).map(([name, tasks]) => {
        return [name, fastify.sortTasks(tasks)]
      })

      const sortedTasks = fastify.config.lanes
        .map(([lane, name]) => {
          const tasks = sortedGroupedTasks.find(([groupLane]) => groupLane === lane)?.[1] || []

          return {
            name,
            lane,
            tasks,
          }
        })

      sharedTaskLanes.resolve(sortedTasks)
    })

    fastify.decorate('listFiles', function (dirPath) {
      if (!dirPath) dirPath = fastify.config.dirPath

      return fs.globSync(path.join(process.cwd(), fastify.config.dirPath, '/**/*'))
    })

    fastify.decorate('assembleTasks', async function (files) {
      const tasks = []

      for await (const file of files) {
        const stats = await stat(file)

        if (stats.isFile()) {
          tasks.push(await TaskFactory(file, fastify.config.dirPath))
        }
      }

      return tasks
    })

    fastify.decorate('tasksToTree', function (tasks) {
      return Object.groupBy(tasks, (task) => {
        return task.relativePath.split('/')[0]
      })
    })

    fastify.decorate('sortTasks', function (tasks) {
     	return tasks.sort(
        firstBy((a, b) => a.priority - b.priority)
          .thenBy((a, b) => a.manualOrder - b.manualOrder)
          .thenBy((a, b) => a.modified - b.modified)
      )
    })
  },

  {
    name: 'list-files',
    dependencies: ['application-config'],
  }
)
