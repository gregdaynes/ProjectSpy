import { join } from 'node:path'
import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'

export default fp(async function app (fastify, opts) {
  await fastify.register(import('./plugins/config.no-load.js'), structuredClone(opts))

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
    ignorePattern: /.*.no-load\.js/,
    options: structuredClone(opts),
  })

  await fastify.register(import('@fastify/formbody'), opts)

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'routes'),
    options: structuredClone(opts),
  })
})
