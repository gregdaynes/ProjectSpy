import { join } from 'node:path'
import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'

export default fp(async function app (fastify, opts) {
  // Manually load config plugin
  await fastify.register(import('./plugins/_config.js'), structuredClone(opts))

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
    options: structuredClone(opts),
    ignoreFilter: (path) => path.startsWith('/_')
  })

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'routes'),
    options: structuredClone(opts),
    autoHooks: true
  })

  fastify.setNotFoundHandler({}, async (request, reply) => {
    fastify.log.info('Request route not found')
    reply.redirect('/')
  })
})
