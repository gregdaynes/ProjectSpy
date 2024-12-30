import fp from 'fastify-plugin'
import fs from 'node:fs/promises'
import { join } from 'node:path'

export default fp(
  async function pluginConfig (fastify, _opts) {
    // check if configuration file v
    const path = join(process.cwd(), '.projectSpy', 'projectspy.json')
    const exists = await pathExists(path)

    if (exists) {
      const { default: config } = await import(path, { with: { type: 'json' }})

      fastify.decorate('config', {
        ...config,
        maxAge: 600000,
        dirPath: '.projectSpy',
      })

    } else {
      fastify.decorate('config', {
        maxAge: 600000,
        dirPath: '.projectSpy',
        lanes: {
          backlog: 'Backlog',
          'in-progress': 'In Progress',
          done: 'Done',
        },
      })
    }
  },
  {
    name: 'application-config',
  }
)

/**
 *
 * @param path
 */
async function pathExists (path) {
  try {
    await fs.stat(path)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw new Error(err)
  }
}
