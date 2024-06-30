import fp from 'fastify-plugin'
import fastifyView from '@fastify/view'
import nunjucks from 'nunjucks'

export default fp(
  async function pluginView (fastify, _opts) {
    fastify.register(fastifyView, {
      engine: { nunjucks },
      templates: ['views'],
      viewExt: 'njk',
      propertyName: 'render',
    })
  },
  {
    dependencies: ['application-config', 'list-files'],
  }
)
