import { join } from 'node:path'
import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'

export default fp(async function app (fastify, opts) {
  await fastify.register(import('./plugins/config.no-load.js'), structuredClone(opts))
  await fastify.register(import('./plugins/assets.js'), structuredClone(opts))
  await fastify.register(import('./plugins/formbody.js'), structuredClone(opts))
  await fastify.register(import('./plugins/view.js'), structuredClone(opts))
  await fastify.register(import('./plugins/list-files.js'), structuredClone(opts))

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'routes'),
    options: structuredClone(opts),
  })
})
