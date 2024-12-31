import { promisify } from 'node:util'
import ChildProcess from 'node:child_process'
import fp from 'fastify-plugin'

const exec = promisify(ChildProcess.exec)

const plugin = {
  name: 'git',
  dependencies: []
}

export default fp(async (fastify) => {
  fastify.decorate('commit', async (paths, message) => {
    if (!Array.isArray(paths)) paths = [paths]

    for (const path of paths) {
      try {
        await exec(`git add ${path}`)
      } catch (err) {
        if (err.stderr !== '') {
          fastify.log.error({ err, path, message }, 'Attempted to add file')
          throw new Error(err)
        }
      }
    }

    try {
      await exec(`git commit -m "project: ${message}"`)
    } catch (err) {
      if (err.stderr !== '') {
        fastify.log.error({ err, paths, message }, 'Attempted to commit file')
        throw new Error(err)
      }
    }
  })

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
