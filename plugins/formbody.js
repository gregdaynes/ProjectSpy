import fp from 'fastify-plugin'

export default fp(
  async function pluginFormbody (fastify, opts) {
    await fastify.register(import('@fastify/formbody'), opts)
  },
  {
    name: 'formbody',
  }
)
