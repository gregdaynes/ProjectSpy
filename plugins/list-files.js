import { glob } from 'node:fs/promises'
import { join } from 'node:path'
import fp from 'fastify-plugin'
import TaskFactory from '../task.js'
import firstBy from 'thenby'

export default fp(
  async function (fastify) {
    function sortFilePathsByTask (taskList, filePaths) {
      return filePaths.sort(
        firstBy((a, b) => taskList.get(a).priority - taskList.get(b).priority)
          .thenBy((a, b) => taskList.get(a).manualOrder - taskList.get(b).manualOrder)
          .thenBy((a, b) => taskList.get(a).modified - taskList.get(b).modified)
      )
    }

    function groupFilePathsByLane () {
      return Object.groupBy(filePathsSorted, (entry) => {
        const lane = entry.replace(dir, '').split('/')[1]
        return lane
      })
    }

    const dir = fastify.config.dirPath
    const lanes = fastify.config.lanes.map(([lane]) => lane)
    const taskList = new Map()

    let filePaths = []
    let filePathsSorted = []
    let filePathsGroupedByLane = {}

    fastify.addHook('onReady', async () => {
      for await (const entry of glob(join(dir, '/**/*'))) {
        const [, lane, name] = entry.replace(dir, '').split('/')

        if (lanes.includes(lane) && name) {
          const task = await TaskFactory(entry, dir)

          taskList.set(entry, task)
          filePaths.push(entry)
        }
      }

      filePathsSorted = sortFilePathsByTask(taskList, filePaths)
      filePathsGroupedByLane = groupFilePathsByLane(filePathsSorted)
    })

    fastify.decorateRequest('taskList', () => taskList)
    fastify.decorateRequest('filePathsGroupedByLane', () => filePathsGroupedByLane)

    fastify.decorateRequest('updatePath', function (oldPath, newPath, newTask) {
      taskList.delete(oldPath)
      taskList.set(newPath, newTask)

      filePaths = filePaths.filter((path) => path !== oldPath)
      filePaths.push(newPath)

      filePathsSorted = sortFilePathsByTask(taskList, filePaths)
      filePathsGroupedByLane = groupFilePathsByLane(filePathsSorted)
    })
  },

  {
    name: 'list-files',
    dependencies: ['application-config'],
  }
)
