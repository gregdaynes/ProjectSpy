/**
 *
 * @param fastify
 */
export default async function (fastify) {
  fastify.get('/info', {
    preHandler: [
      fastify.preHandlerTaskLanes,
    ]
  }, async (request, reply) => {
    const data = {
      ...reply.locals,
      page: {
        title: 'Tasks Dashboard',
      },
      showInfo: true
    }

    return reply.view('home', data)
  })
}
