export default async function (fastify) {
  fastify.get('/', {
    preHandler: [
      fastify.preHandlerTaskLanes,
    ]
  }, async (request, reply) => {
    const data = {
      ...reply.locals,
      page: {
        title: 'Tasks Dashboard',
      },
    }

    return reply.view('home', data)
  })
}
