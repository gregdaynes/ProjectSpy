/**
 *
 * @param fastify
 */
export default async function (fastify) {
  fastify.get('/view/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:view:params',
        type: 'object',
        properties: {
          lane: {
            type: 'string',
            // TODO use oneOf for lane
          },
          filename: {
            type: 'string'
            // TODO check for presence of .md?
          }
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
    const { lane, task, filename, builtTask } = request.ctx

    const data = {
      ...reply.locals,
      lanes: Object.entries(request.server.config.lanes),
      page: {
        title: 'Task',
      },
      task: {
        ...builtTask,
        content: task.render(),
        rawContents: task.rawContents(),
        lane,
        filePath: task.relativePath,
        actions: {
          ...task.actions,
          update: `/update/${lane}/${filename}`
        }
      },
      viewDialog: true
    }

    return reply.view('view', data)
  })
}
