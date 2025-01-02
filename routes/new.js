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
    if (!fastify.config.laneKeys.includes(lane)) {
      throw new Error('Lane invalid')
    }

    const contents = request.body.content

    try {
      const { filePath, fileName } = await request.server.v2create({ lane, fileName: name, contents })
      await request.commit(filePath, `task ${lane}/${fileName} created`)
      return reply.redirect(`/view/${lane}/${fileName}`)
    } catch (err) {
      throw new Error(err)
    }
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
