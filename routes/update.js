import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

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
    const { lane: currentLane, filename, filePath } = request.ctx
    const { lane: updatedLane, content: updatedContent } = request.body

    const fileContent = await readFile(filePath, { encoding: 'utf-8' })

    let updatedFilePath = filePath
    const hasUpdatedContent = fileContent !== updatedContent
    const hasUpdatedPath = currentLane !== updatedLane

    // move the file if the lane has changed
    if (hasUpdatedPath) {
      updatedFilePath = join(request.server.config.dirPath, updatedLane, filename)
    }

    // Write file changes including new file if moved
    if (hasUpdatedContent || hasUpdatedPath) {
      await request.server.changeFile({
        lane: updatedLane,
        filename,
        filePath: updatedFilePath,
        contents: updatedContent
      })
    }

    // delete the old file
    if (hasUpdatedPath) {
      await request.server.deleteFile({ filename, lane: currentLane, filePath })
    }

    return reply.redirect(`/view/${updatedLane}/${filename}`)
  })
}
