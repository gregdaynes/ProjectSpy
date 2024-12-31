import { join } from 'node:path'
import staticFiles from '@fastify/static'
import fp from 'fastify-plugin'

const plugin = {
  name: 'Assets',
  dependencies: ['application-config'],
}

export default fp(async (fastify) => {
  // prevent logging with assets
  fastify.addHook('onRoute', function (opts) {
    if (opts.path === '/assets/*') {
      opts.logLevel = 'silent'
    }
  })

  fastify.register(staticFiles, {
    root: join(import.meta.dirname, '..', 'public'),
    prefix: '/assets/',
    send: {
      lastModified: true,
      maxAge: fastify.config.maxAge,
    },
  })

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
