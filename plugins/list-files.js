import fs from 'node:fs'
import path from 'node:path'
import fp from 'fastify-plugin'

export default fp(
  async function (fastify) {
    fastify.addHook('onReady', function () {
      const files = fastify.listFiles()
      const filesStripped = fastify.stripCommonPath(files)
      const fileTree = fastify.fileListToTree(filesStripped)
      console.log('fileTree', JSON.stringify(fileTree, null, 2))

      fastify.decorate('fileTree', fileTree)
    })

    fastify.addHook('preHandler', function (request, reply, done) {
      reply.locals = Object.assign({}, reply.locals, {
        fileTree: fastify.fileTree,
      })

      done()
    })

    fastify.decorate('listFiles', function (dirPath) {
      if (!dirPath) dirPath = fastify.config.dirPath

      function getAllFiles (dirPath, arrayOfFiles) {
        const files = fs.readdirSync(dirPath)

        arrayOfFiles = arrayOfFiles || []

        files.forEach(function (file) {
          if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
          } else {
            arrayOfFiles.push(path.join(import.meta.dirname, dirPath, '/', file))
          }
        })

        return arrayOfFiles
      }

      return getAllFiles(dirPath, [])
    })

    fastify.decorate('stripCommonPath', function (files) {
      const dirPath = fastify.config.dirPath

      return files.map(file => file.replace(path.join(import.meta.dirname, dirPath, '/'), ''))
    })

    fastify.decorate('fileListToTree', function (files) {
      const result = []
      const level = { result }

      files.forEach((path) => {
        path.split('/').reduce((acc, fileName) => {
          if (!acc[fileName]) {
            acc[fileName] = { result: [] }

            // process fileName here
            // 1) handle date
            const [dateMatch] = fileName.match(/^\d{4}-\d{2}-\d{2}/) || []
            const date = dateMatch ? new Date(dateMatch) : null

            // 2) handle file extension
            const [extMatch] = fileName.match(/\.[a-z]+$/) || []
            const ext = extMatch ? extMatch.slice(1) : null

            // 3) handle fileName name
            const name = fileName.replace(/\.[a-z]+$/, '').replace(/^\d{4}-\d{2}-\d{2}/, '').replace(/-/g, ' ').trim()
            console.log(name)

            acc.result.push({ name, fileName, date, ext, children: acc[fileName].result })
          }

          return acc[fileName]
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
