import fp from 'fastify-plugin'
import fs from 'node:fs/promises'

export default fp(
  async function (fastify, _opts) {
    fastify.decorate('pathExists', async function (path) {
      try {
        await fs.stat(path)
        return true
      } catch (err) {
        if (err.code === 'ENOENT') {
          return false
        }

        throw new Error(err)
      }
    })
  },
  {
    name: 'application-utils'
  }
)
