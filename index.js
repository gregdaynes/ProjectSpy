import fs from 'node:fs'
import { join } from 'node:path'
import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import { marked } from 'marked'

export default fp(async function app (fastify, opts) {
  await fastify.register(import('./plugins/config.no-load.js'), structuredClone(opts))

  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
    ignorePattern: /.*.no-load\.js/,
    options: structuredClone(opts),
  })

  await fastify.register(import('@fastify/formbody'), opts)

  fastify.get('/', async (request, reply) => {
    return reply.render('base.njk')
  })

  fastify.get('/view/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params

    const foundLane = reply.locals.taskLanes.find((taskLane) => taskLane.lane == lane)
    const foundTask = foundLane.tasks.find((task) => task.relativePath == join(lane, filename))

    reply.locals.task = {
      ...foundTask,
      content: foundTask.render(),
      lane,
      filePath: foundTask.relativePath,
    }

    return reply.render('view.njk')
  })

  fastify.post('/update/:lane/:filename', async (request, reply) => {
    let { lane, filename } = request.params
    const filePath = join(process.cwd(), fastify.config.dirPath, lane, filename)
    let fileContents = fs.readFileSync(filePath, 'utf8')

    if (request.body.contents) {
      // get the contents of the request
      fileContents = request.body.contents
      // write the new contents to the file
      fs.writeFileSync(filePath, fileContents)
    }

    const content = marked.parse(fileContents)

    // move the file if the lane has changed
    if (lane !== request.body.lane) {
      lane = request.body.lane
      const newFilePath = join(process.cwd(), fastify.config.dirPath, lane, filename)
      fs.writeFileSync(newFilePath, fileContents)
      fs.unlinkSync(filePath)
    }

    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    reply.locals.title = title
    reply.locals.content = content
    reply.locals.lane = lane
    reply.locals.filename = filename

    return reply.render('view.njk')
  })
})
