import fp from 'fastify-plugin'

const plugin = {
  name: 'request-prepare-task',
  dependencies: [],
}

export default fp(async (fastify) => {
  fastify.decorate('buildTask', (task) => ({
    id: `${task.lane}-${task.filename}`,
    title: task.title,
    descriptionHTML: task.descriptionHTML,
    tags: task.tags || [],
    priority: task.priority,
    actions: {
      view: `/view/${task.relativePath}`,
    },
  }))

  fastify.decorate('preHandlerTask', async (request, reply) => {
    const { lane, filename } = request.ctx
    const task = request.taskLanes().get(lane).get(filename)

    if (task === undefined) {
      return reply.redirect('/')
    }

    request.ctx = {
      ...request.ctx,
      task,
      builtTask: fastify.buildTask(task)
    }
  })
}, plugin)
