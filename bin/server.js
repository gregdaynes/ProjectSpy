#!/usr/bin/env node

import { parseArgs } from 'node:util'
import open from 'open'
import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'
import app from '../index.js'

const { positionals } = parseArgs({
  options: {
    init: {
      type: 'boolean',
    },
    new: {
      type: 'boolean',
    }
  },
  strict: true,
  allowPositionals: true
})

const fastify = Fastify({
  logger: true,
  pluginTimeout: positionals[0] ? 60000 : 1000,
})

fastify.register(app)

const closeListeners = closeWithGrace({ delay: 500 }, async ({ err }) => {
  if (err) fastify.log.error(err)
  await fastify.close()
})

fastify.addHook('onClose', async () => {
  closeListeners.uninstall()
})

try {
  await fastify.listen({ port: process.env.PORT || 8080 })

  const { address, port } = fastify.addresses().find((address) => address.family === 'IPv4')

  await open(`http://${address}:${port}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
