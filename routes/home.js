export default async function (fastify) {
  fastify.get('/', async (request, reply) => {
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
