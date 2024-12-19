export default async function (fastify) {
  fastify.get('/delete/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:delete:params',
        type: 'object',
        properties: {
          lane: {
            type: 'string',
          },
          filename: {
            type: 'string',
          },
        },
        required: ['lane', 'filename']
      }
    },
    preHandler: [
      fastify.preHandlerParams,
      fastify.preHandlerTask,
      fastify.preHandlerTaskLanes,
    ]
  }, async (request, reply) => {
    const { lane, task, builtTask } = request.ctx

    const data = {
      ...reply.locals,
      lanes: request.server.config.lanes,
      page: {
        title: 'Task',
      },
      task: {
        ...builtTask,
        content: task.render(),
        rawContents: task.rawContents(),
        lane,
        filePath: task.relativePath,
      },
      confirmDialog: true,
    }

    return reply.view('view', data)
  })

  fastify.post('/delete/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:delete:params:post',
        type: 'object',
        properties: {
          lane: {
            type: 'string',
          },
          filename: {
            type: 'string',
          },
        },
        required: ['lane', 'filename']
      }
    },
    preHandler: [
      fastify.preHandlerParams,
    ]
  }, async (request, reply) => {
    const { lane, filename, filePath } = request.ctx

    const exists = await request.server.pathExists(filePath)
    if (!exists) {
      return reply.redirect('/')
    }

    await request.server.deleteFile({ filename, lane, filePath })

    return reply.redirect('/')
  })
}
