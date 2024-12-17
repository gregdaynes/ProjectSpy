export default function (fastify, opts) {
  fastify.addHook('onRequest', async (request, reply) => {
    request.buildTask = buildTask

    request.dir = request.server.config.dirPath
  })
}

function buildTask (task) {
  return {
    relativePath: task.relativePath,

    title: task.title,
    descriptionHTML: task.descriptionHTML,
    tags: task.tags || [],
    priority: task.priority,
    actions: {
      view: `/view/${task.relativePath}`,
    },
  }
}
