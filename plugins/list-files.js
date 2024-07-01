import fs from 'node:fs'
import path from 'node:path'
import fp from 'fastify-plugin'
import { watch } from 'node:fs/promises'

export default fp(
  async function (fastify) {
    let sharedFileTree = []

    const abortController = new AbortController()
    const { signal } = abortController
    const watcher = watch(path.join(process.cwd(), fastify.config.dirPath), { recursive: true, signal })

    ;(async () => {
      for await (const { filename } of watcher) {
        const lanes = fastify.config.lanes.map(([lane]) => lane)
        if (!lanes.includes(filename.split('/')[0])) {
          continue
        }

        fastify.log.info('File changed: %s', filename)
        fastify.updateFileTree()
      }
    })()

    fastify.addHook('onReady', function () {
      fastify.updateFileTree()
    })
    fastify.addHook('preHandler', function (request, reply, done) {
      reply.locals = Object.assign({}, reply.locals, {
        fileTree: sharedFileTree,
      })

      done()
    })

    fastify.addHook('onClose', function () {
      abortController.abort()
    })

    fastify.decorate('updateFileTree', function () {
      const files = fastify.listFiles()
      const filesStripped = fastify.stripCommonPath(files)
      const fileTree = fastify.fileListToTree(filesStripped)

      const sortedFileTree = fastify.config.lanes
        .map(([lane, name]) => {
          return fileTree.find((file) => file.path === lane)
        })

      sharedFileTree = sortedFileTree
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
