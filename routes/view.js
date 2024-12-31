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
    const { task, builtTask } = request.ctx

    const data = {
      ...reply.locals,
      page: {
        title: 'Task',
      },
      task: {
        ...builtTask,
        rawContents: task.rawContents(),
        filePath: task.relativePath,
        // actions
          // view
          // update
          // archive
      },
      viewDialog: true
    }

    return reply.view('view', data)
  })
}
