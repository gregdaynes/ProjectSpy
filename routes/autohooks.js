/**
 *
 * @param fastify
 */
export default function (fastify) {
  fastify.addHook('onRequest', async (request) => {
    request.taskLanes = fastify.taskLanes
  })

  fastify.addHook('onRequest', async (request) => {
    request.config = fastify.config
  })

  fastify.addHook('onRequest', async (request) => {
    request.logToTask = fastify.logToTask
  })

  fastify.addHook('onRequest', async (request) => {
    request.commit = fastify.commit
  })
}
