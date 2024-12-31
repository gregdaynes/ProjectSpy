import fp from 'fastify-plugin'
import { EventEmitter } from 'node:events'

const plugin = {
  name: 'application-events',
  dependencies: []
}

export default fp(async (fastify) => {
  const bus = new EventEmitter({ captureRejections: true })

  bus.on('error', (err) => {
    fastify.log.error({ err }, 'Error on event-bus')
  })

  fastify.decorate('eventBus', () => bus)

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
