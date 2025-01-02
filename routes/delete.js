/**
 *
 * @param fastify
 */
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
        title: 'Delete Task',
        body: `Do you really want to delete <i>${task.title}</i>?`
      },
      task: {
        ...builtTask,
        content: task.render(),
        rawContents: task.rawContents(),
        lane,
        filePath: task.relativePath,
      },
      actions: {
        close: { label: 'Close', action: `/view/${task.relativePath}`, method: 'get' },
        cancel: { label: 'Cancel', action: `/view/${task.relativePath}`, method: 'get' },
        confirm: { label: 'Delete', action: `/delete/${task.relativePath}`, method: 'post' },
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
    const { lane, filename } = request.ctx
    const { fileName, filePath } = await request.server.v2delete({ fileName: filename, lane })

    await request.commit(filePath, `task ${lane}/${fileName} deleted`)

    return reply.redirect('/')
  })
}
