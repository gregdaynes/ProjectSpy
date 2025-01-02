import { join } from 'node:path'
import slugify from 'slugify'
import { randomBytes } from 'node:crypto'
import { pathExists } from 'lib/utils.js'

/**
 *
 * @param fastify
 */
export default async function (fastify) {
  fastify.post('/create', {
    schema: {
      body: {
        $id: 'app:new:body',
        type: 'object',
        properties: {
          lane: {
            type: 'string'
          },
          content: {
            type: 'string',
          },
          name: {
            type: 'string'
          }
        },
        required: ['lane', 'name']
      }
    }
  }, async (request, reply) => {
    const { lane, name } = request.body
    let contents = request.body.content

    let filename = slugify(name, { strict: true, lower: true }) + '.md'
    let filePath = join(request.config.dirPath, lane, filename)

    if (await pathExists(filePath)) {
      const suffix = randomBytes(3).toString('hex')

      filename = slugify(name, { strict: true, lower: true }) + `-${suffix}.md`
      filePath = join(request.config.dirPath, lane, filename)
    }

    contents = request.logToTask(contents, 'Created task')

    await request.server.changeFile({ lane, filePath, filename, contents })

    await request.commit(filePath, `task ${lane}/${filename} created`)

    return reply.redirect(`/view/${lane}/${filename}`)
  })

  fastify.get('/new', {
    schema: {
      query: {
        $id: 'app:task:new:query',
        type: 'object',
        properties: {
          lane: {
            type: 'string'
          }
        }
      }
    },
    preHandler: [
      fastify.preHandlerTaskLanes
    ]
  }, async (request, reply) => {
    const { lane } = request.query
    const data = {
      ...reply.locals,
      page: {
        title: 'New Task',
      },
      task: {
        task: 'New Task',
        content: '',
        rawContents: '',
        lane: lane || null,
        tags: [],
        actions: {
          update: { label: 'Create', action: '/create', method: 'post' },
        },
        filePath: '',
      },
      viewDialog: true
    }

    return reply.view('new', data)
  })
}
