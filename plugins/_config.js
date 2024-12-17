import fp from 'fastify-plugin'

export default fp(
  async function pluginConfig (fastify, _opts) {
    fastify.decorate('config', {
      dirPath: '.projectSpy',
      lanes: [
        ['backlog', 'Backlog'],
        ['in-progress', 'In Progress'],
        ['done', 'Done'],
      ],
    })
  },
  {
    name: 'application-config',
  }
)
