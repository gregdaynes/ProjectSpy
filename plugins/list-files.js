import { join } from 'node:path'
import fp from 'fastify-plugin'
import TaskFactory from '../task.js'
import chokidar from 'chokidar'

export default fp(
  async function (fastify) {
    const dir = join(process.cwd(), fastify.config.dirPath)
    const lanes = Object.entries(fastify.config.lanes).map(([lane]) => lane)
    const taskList = new Map()

    // each lane should be it's own map
    for (const lane of lanes) {
      taskList.set(lane, new Map())
    }

    fastify.addHook('onReady', async () => {
      const watcher = chokidar.watch(dir, {
        ignored: (path, stats) => stats?.isFile() && !path.endsWith('.md'), // only watch md files
        persistent: true
      })

      watcher.on('add', async function (path) {
        //fastify.log.debug({ path }, 'File added')
        const [, lane, filename] = path.replace(dir, '').split('/')

        if (lanes.includes(lane)) {
          const task = await TaskFactory(path, dir)
          taskList.get(lane).set(filename, task)
        }

        fastify.eventBus().emit(`task:change:${lane}:${filename}`)
      })

      watcher.on('change', async function (path) {
        //fastify.log.debug({ path }, 'File changed')
        const [, lane, filename] = path.replace(dir, '').split('/')

        if (lanes.includes(lane)) {
          const task = await TaskFactory(path, dir)
          taskList.get(lane).set(filename, task)
        }

        fastify.eventBus().emit(`task:change:${lane}:${filename}`)
      })

      watcher.on('unlink', function (path) {
        //fastify.log.debug({ path }, 'File unlinked')
        const [, lane, filename] = path.replace(dir, '').split('/')

        if (lanes.includes(lane)) {
          taskList.get(lane).delete(filename)
        }

        fastify.eventBus().emit(`task:delete:${lane}:${filename}`)
      })

      watcher.on('error', function (err) {
        fastify.log.error({ err }, 'File change error')
      })
    })

    fastify.decorate('taskList', () => taskList)
  },

  {
    name: 'list-files',
    dependencies: ['application-config', 'application-events'],
  }
)
