export default async function (fastify) {
  fastify.get('/', async (request, reply) => {
    const filePathsGroupedByLane = request.filePathsGroupedByLane()
    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)

          return {
            relativePath: task.relativePath,
            title: task.title,
            descriptionHTML: task.descriptionHTML,
          }
        }),
      }
    })

    const data = {
      ...reply.locals,
      taskLanes,
      tasks: request.taskList(),
    }

    return reply.render('ps-home.webc', data)
  })
}
