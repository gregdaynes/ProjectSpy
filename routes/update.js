/**
 *
 * @param fastify
 */
export default async function (fastify) {
  fastify.post('/update/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:update:params',
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
      },
      body: {
        $id: 'app:update:body',
        type: 'object',
        properties: {
          lane: {
            type: 'string',
          },
          content: {
            type: 'string',
          },
        },
        required: ['lane', 'content']
      }
    },
    preHandler: [
      fastify.preHandlerParams,
    ]
  }, async (request, reply) => {
    const { lane, filename } = request.ctx
    const { lane: newLane, content: newContents } = request.body

    if (!fastify.config.laneKeys.includes(newLane)) {
      throw new Error('Lane invalid')
    }

    try {
      const { filePath, fileName } = await request.server.v2update({ lane, fileName: filename, newLane, newContents })

      await request.commit(filePath, `task ${lane}/${fileName} updated`)
      return reply.redirect(`/view/${newLane}/${fileName}`)
    } catch (err) {
      throw new Error(err)
    }
  })
}
