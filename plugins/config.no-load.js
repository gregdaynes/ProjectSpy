import fp from 'fastify-plugin'

export default fp(
  async function pluginConfig (fastify, _opts) {
    fastify.decorate('config', {
      dirPath: '.projectSpy',
    })
  },
  {
    name: 'application-config',
  }
)
