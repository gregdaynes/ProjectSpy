import fp from 'fastify-plugin'

const plugin = {
  name: 'request-prepare-task',
  dependencies: [],
}

export default fp(async (fastify) => {
  fastify.decorate('buildTask', (task, actionsList = ['view']) => {
    function actions (relativePath, actions) {
      return [
        ['view', { label: 'View', action: `/view/${relativePath}`, method: 'get' }],
        ['update', { label: 'Update', action: `/update/${relativePath}`, method: 'post' }],
        ['delete', { label: 'Delete', action: `/delete/${relativePath}`, method: 'get' }],
        ['archive', { label: 'archive', action: `/archive/${relativePath}`, method: 'get' }],
      ].filter(([name, action]) => actions.includes(name))
    }

    return {
      id: `${task.lane}-${task.filename}`,
      title: task.title,
      lane: task.lane,
      descriptionHTML: task.descriptionHTML,
      tags: task.tags || [],
      priority: task.priority,
      actions: Object.fromEntries(actions(task.relativePath, actionsList)),
    }
  })

  fastify.decorate('preHandlerTask', async (request, reply) => {
    const { lane, filename } = request.ctx
    const task = request.taskLanes().get(lane).get(filename)

    if (task === undefined) {
      return reply.redirect('/')
    }

    request.ctx = {
      ...request.ctx,
      task,
      builtTask: fastify.buildTask(task, ['view', 'update', 'archive', 'delete'])
    }
  })
}, plugin)
