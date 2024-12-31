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
    const { lane, name } = request.body
    let content = request.body.content

    const filename = slugify(name, { strict: true, lower: true }) + '.md'

    const filePath = join(request.config.dirPath, lane, filename)

    content = request.logToTask(content, 'Created task')

    await writeFile(filePath, content)

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
