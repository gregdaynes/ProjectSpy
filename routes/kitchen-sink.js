export default async function (fastify) {
  fastify.get('/kitchen-sink', async (request, reply) => {
    return reply.view('kitchen-sink', {
      page: {
        title: 'Kitchen sink'
      }
    })
  })
}
