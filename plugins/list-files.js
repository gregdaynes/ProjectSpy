import fp from 'fastify-plugin'
import TaskFactory from '../task.js'
import chokidar from 'chokidar'

const plugin = {
  name: 'list-files',
  dependencies: ['application-config', 'application-events'],
}

export default fp(async (fastify) => {
  const diskNames = fastify.config.lanes.map(([diskName]) => diskName)
  const taskLanes = new Map()

  for (const diskName of [...diskNames, '_archive']) {
    taskLanes.set(diskName, new Map())
  }

  fastify.addHook('onReady', async () => {
    const watcher = chokidar.watch(fastify.config.absolutePath, {
      // only watch md files
      ignored: (path, stats) => stats?.isFile() && !path.endsWith('.md'),
      persistent: true
    })

    const setTaskFn = setTaskList.bind(null, fastify, taskLanes)

    watcher.on('add', setTaskFn.bind(null, 'change'))
    watcher.on('change', setTaskFn.bind(null, 'change'))
    watcher.on('unlink', setTaskFn.bind(null, 'delete'))
    watcher.on('error', function (err) {
      fastify.log.error({ err }, 'File change error')
    })
  })

  fastify.decorate('taskLanes', () => taskLanes)

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)

/**
 * @param {FastifyInstance} fastify fastify instance
 * @param {Map} taskLanes map of task lanes indexed by diskName
 * @param {string} eventName name of event to emit on completion
 * @param {string} path file path from event
 * @returns {void}
 */
async function setTaskList (fastify, taskLanes, eventName, path) {
  fastify.log.debug({ taskLanes, eventName, path }, 'setTaskList')
  const [, relativeDir, fileName] = path.replace(fastify.config.absolutePath, '').split('/')
  const taskLane = taskLanes.get(relativeDir)
  if (!taskLane) return

  if (eventName === 'delete') {
    taskLane.delete(fileName)
  } else {
    const task = await TaskFactory(path, fastify.config.absolutePath)
    taskLane.set(fileName, task)
  }

  fastify.eventBus().emit(`task:${eventName}:${relativeDir}:${fileName}`)
  fastify.log.debug({ path }, `File ${eventName}`)
}
