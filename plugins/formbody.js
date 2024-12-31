import fp from 'fastify-plugin'

const plugin = {
  name: 'formbody',
  dependencies: []
}

export default fp(async (fastify, opts) => {
  await fastify.register(import('@fastify/formbody'), opts)

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
