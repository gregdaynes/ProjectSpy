import fp from 'fastify-plugin'
import { join } from 'node:path'
import { createReadStream } from 'node:fs'

export default fp(async (fastify, opts) => {
  opts = Object.assign({}, {
    liveCSS: true,
  }, opts)

  await fastify.register(import('@fastify/websocket'))

  fastify.decorate('generateLiveReloadScript', function () {
    return `<script>
      document.write('<script src="http://'
        + (location.host || 'localhost').split(':')[0]
        + ':3000/livereload.js"></'
        + 'script>')
      </script>`
  })

  fastify.decorate('sendLiveReloadCommand', function (command, path) {
    fastify.websocketServer.clients.forEach((client) => {
      client.send(JSON.stringify({
        command,
        path,
        liveCSS: opts.liveCSS,
      }))
    })
  })

  fastify.get('/livereload.js', (req, reply) => {
    const filePath = join(import.meta.dirname, import.meta.resolve('livereload-js').split(import.meta.dirname)[1])

    const stream = createReadStream(filePath, 'utf8')
    reply.header('Content-Type', 'text/javascript; charset=utf-8')
    reply.send(stream)
  })

  fastify.get('/livereload', { websocket: true }, (socket, request) => {
    socket.on('message', message => {
      message = JSON.parse(message.toString())

      if (message.command === 'hello') {
        request.log.debug('Client requested handshake...')

        const data = JSON.stringify({
          command: 'hello',
          protocols: [
            'http://livereload.com/protocols/official-7',
            'http://livereload.com/protocols/official-8',
            'http://livereload.com/protocols/official-9',
            'http://livereload.com/protocols/2.x-origin-version-negotiation',
            'http://livereload.com/protocols/2.x-remote-control'],
          serverName: 'fastify-livereload',
        })

        return socket.send(data)
      }

      if (request.command === 'info') {
        request.log.debug({ message }, 'Client requested info...')
      }
    })
  })
}, {
  name: 'livereload',
  dependencies: ['application-config'],
})
