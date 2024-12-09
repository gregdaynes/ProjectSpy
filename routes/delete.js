import fs from 'node:fs/promises'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/delete/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const filePath = join(request.server.config.dirPath, lane, filename)

    const task = request.taskList().get(filePath)
    if (task === undefined) {
      return reply.redirect('/')
    }

    const buildTask = task => ({
      relativePath: task.relativePath,
      title: task.title,
      descriptionHTML: task.descriptionHTML,
      tags: task.tags || [],
      priority: task.priority,
      actions: {
        view: `/view/${task.relativePath}`,
      },
    })

    const filePathsGroupedByLane = request.filePathsGroupedByLane()
    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)
          return buildTask(task)
        }) || [],
      }
    })

    const builtTask = buildTask(task)
    builtTask.actions.update = `/update/${task.relativePath}`

    const data = {
      ...reply.locals,
      taskLanes,
      tasks: request.taskList(),
      lanes: request.server.config.lanes,
      page: {
        title: 'Task',
      },
      task: {
        ...builtTask,
        content: task.render(),
        rawContents: task.rawContents(),
        lane,
        filePath: task.relativePath,
      },
      confirmDialog: true,
    }

    return reply.view('view', data)
  })

  fastify.post('/delete/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const safeName = filename.replace('/', '_')
    const filePath = join(request.server.config.dirPath, lane, safeName)

    const exists = await pathExists(filePath)
    if (exists) await fs.unlink(filePath)

    request.deletePath(filePath)

    return reply.redirect('/')
  })
}

async function pathExists (path) {
  try {
    await fs.stat(path)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw new Error(err)
  }
}
