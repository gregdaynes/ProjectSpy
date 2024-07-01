import fs from 'node:fs'
import path from 'node:path'
import fp from 'fastify-plugin'

export default fp(
  async function (fastify) {
    fastify.addHook('onReady', await function () {
      const files = fastify.listFiles()
      const filesStripped = fastify.stripCommonPath(files)
      const fileTree = fastify.fileListToTree(filesStripped)

      const sortedFileTree = fastify.config.lanes
      	.map((lane) => {
      		return fileTree.find((file) => file.title === lane)
      	})

      fastify.decorate('fileTree', sortedFileTree)
    })

    fastify.addHook('preHandler', function (request, reply, done) {
      reply.locals = Object.assign({}, reply.locals, {
        fileTree: fastify.fileTree,
      })

      done()
    })

    fastify.decorate('listFiles', function (dirPath) {
      if (!dirPath) dirPath = fastify.config.dirPath

      return fs.globSync(path.join(process.cwd(), fastify.config.dirPath, '/**/*'))
    })

    fastify.decorate('stripCommonPath', function (files) {
      const dirPath = fastify.config.dirPath

      return files.map(file => file.replace(path.join(process.cwd(), dirPath, '/'), ''))
    })

    fastify.decorate('fileListToTree', function (files) {
      const result = []
      const level = { result }

      files.forEach((path) => {
        path.split('/').reduce((r, name, i, a) => {
          if (!r[name]) {
            r[name] = { result: [] }

            const title = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

            r.result.push({ name, title, path, children: r[name].result })
          }

          return r[name]
        }, level)
      })

      return result
    })
  },

  {
    name: 'list-files',
    dependencies: ['application-config'],
  }
)
