import fs from 'node:fs/promises'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/delete/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const filePath = join(request.dir, lane, filename)

    const task = request.taskList().get(filePath)
    if (task === undefined) {
      return reply.redirect('/')
    }

    const filePathsGroupedByLane = request.filePathsGroupedByLane()
    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)
          return request.buildTask(task)
        }) || [],
      }
    })

    const builtTask = request.buildTask(task)
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
    const filePath = join(request.dir, lane, safeName)

    const exists = await request.pathExists(filePath)
    if (exists) await fs.unlink(filePath)

    request.deletePath(filePath)

    return reply.redirect('/')
  })
}
