#!/usr/bin/env node

// Read the .env file.
import * as dotenv from 'dotenv'
import { join } from 'path'
import open from 'open'
import { parseArgs } from 'node:util'

// Require the framework
import Fastify from 'fastify'

// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'

// Dotenv config
dotenv.config()

const { positionals, } = parseArgs({
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

const cmd = positionals[0]
const config = {
  logger: true,
  pluginTimeout: cmd ? 60000 : 1000,
}

// Instantiate Fastify with some config
const app = Fastify(config)

// Register your application as a normal plugin.
app.register(await import(join(import.meta.dirname, '..', 'index.js')), {
  cmd: positionals[0]
})

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 }, async function ({ signal, err, manual }) {
  if (err) {
    app.log.error(err)
  }
  await app.close()
})

app.addHook('onClose', async (instance, done) => {
  closeListeners.uninstall()
  done()
})

// Start listening.
try {
  await app.listen({ port: process.env.PORT || 8080 })

  const { address, port } = app.addresses().find((address) => address.family === 'IPv4')

  await open(`http://${address}:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
