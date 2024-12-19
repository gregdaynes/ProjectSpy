import fp from 'fastify-plugin'
import { EventEmitter } from 'node:events'

export default fp(
  async function (fastify, opts) {
    const bus = new EventEmitter({ captureRejections: true })

    bus.on('error', (err) => {
      fastify.log.error({ err }, 'Error on event-bus')
    })

    fastify.decorate('eventBus', () => bus)
  }, {
    name: 'application-events'
  }
)
