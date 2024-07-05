export default async function (fastify) {
  fastify.get('/webc', async (request, reply) => {
    return { test: 'test' }
  })
}
