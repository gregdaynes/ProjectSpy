import { join } from 'node:path'
import staticFiles from '@fastify/static'
import fp from 'fastify-plugin'

export default fp(
  async function assetsPlugin (fastify, _opts) {
    // prevent logging with assets
    fastify.addHook('onRoute', function (opts) {
      if (opts.path === '/assets/*') {
        opts.logLevel = 'silent'
      }
    })

    fastify.register(staticFiles, {
      root: join(import.meta.dirname, '..', 'public'),
      prefix: '/assets/',
    })
  },
  {
    dependencies: ['application-config'],
  }
)
