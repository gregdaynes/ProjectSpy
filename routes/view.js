import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/view/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const filePath = join(request.server.config.dirPath, lane, filename)

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
    }

    return reply.view('view', data)
  })
}
