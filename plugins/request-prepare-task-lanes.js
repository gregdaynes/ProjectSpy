import fp from 'fastify-plugin'
import slugify from 'slugify'

const plugin = {
  name: 'request-prepare-task-lanes',
  dependencies: ['request-prepare-task'],
}

export default fp(async (fastify) => {
  fastify.decorate('preHandlerTaskLanes', async (request, reply) => {
    reply.locals.taskLanes = []

    for (const [slug, name] of request.config.lanes) {
      const tasks = [...request.taskLanes().get(slug)]
        .map(([, task]) => fastify.buildTask(task))
        .sort((a, b) => b.priority - a.priority)

      const lane = {
        name,
        slug,
        tasks,
        count: tasks.length,
      }

      reply.locals.taskLanes.push(lane)
      reply.locals.searchObject = JSON.stringify(buildSearchObject(request.taskLanes()), null, 2)
    }
  })
}, plugin)

/**
 *
 * @param taskList
 */
function buildSearchObject (taskList) {
  const searchObject = []

  for (const [lane, tasks] of taskList) {
    for (const [filename, task] of tasks) {
      const text = `${task.title} ${task.description}`.toLowerCase()

      searchObject.push([
        text,
        slugify(`${lane}-${filename}`)
      ])
    }
  }

  return searchObject
}
