import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import slugify from 'slugify'

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
    const { lane, content, name } = request.body

    const filename = slugify(name, { strict: true, lower: true }) + '.md'

    const filePath = join(request.config.dirPath, lane, filename)

    const { promise, resolve, reject } = Promise.withResolvers()

    request.eventBus.on(`task:add:${lane}:${filename}`, () => {
      reply.redirect(`/view/${lane}/${filename}`)
      resolve()
    })

    await writeFile(filePath, content)

    return promise
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
      lanes: request.config.lanes,
      task: {
        task: 'New Task',
        content: '',
        rawContents: '',
        lane: lane || null,
        tags: [],
        actions: {
          update: '/create'
        },
        filePath: '',
      },
      viewDialog: true
    }

    return reply.view('new', data)
  })
}
