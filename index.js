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

  fastify.get('/', async (request, reply) => {
    return reply.render('base.njk')
  })

  fastify.get('/task/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const filePath = join(process.cwd(), fastify.config.dirPath, lane, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const content = marked.parse(fileContents)

    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    reply.locals.title = title
    reply.locals.content = content

    return reply.render('task.njk')
  })
})
