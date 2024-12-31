import fp from 'fastify-plugin'
import { pathExists } from 'lib/utils.js'

const plugin = {
  name: 'application-utils',
  dependencies: []
}

export default fp(async (fastify) => {
  fastify.decorate('pathExists', pathExists)

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
