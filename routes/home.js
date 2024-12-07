export default async function (fastify) {
  fastify.get('/', async (request, reply) => {
    const filePathsGroupedByLane = request.filePathsGroupedByLane()

    const buildTask = task => ({
      relativePath: task.relativePath,
      title: task.title,
      descriptionHTML: task.descriptionHTML,
      tags: task.tags || [],
      actions: {
        view: `/view/${task.relativePath}`,
      },
    })

    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)
          return buildTask(task)
        }) || [],
      }
    })

    const data = {
      ...reply.locals,
      page: {
        title: 'Tasks Dashboard',
      },
      taskLanes,
    }

    return reply.view('home', data)
  })
}
