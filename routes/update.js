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
    let { lane: updatedLane, content: updatedContent } = request.body

    const fileContent = await readFile(filePath, { encoding: 'utf-8' })
    let updatedFilePath = filePath

    const hasUpdatedContent = fileContent.trim() != updatedContent.trim()
    if (hasUpdatedContent) {
      updatedContent = request.logToTask(updatedContent, 'Updated task')
    }

    // move the file if the lane has changed
    const hasUpdatedPath = currentLane != updatedLane
    if (hasUpdatedPath) {
      updatedFilePath = join(request.server.config.dirPath, updatedLane, filename)
      updatedContent = request.logToTask(updatedContent, `Moved task to ${updatedLane}`)
    }

    // Write file changes including new file if moved
    await request.server.changeFile({
      lane: updatedLane,
      filename,
      filePath: updatedFilePath,
      contents: updatedContent
    })

    // delete the old file
    if (hasUpdatedPath) {
      await request.server.deleteFile({ filename, lane: currentLane, filePath })
    }

    await request.commit([filePath, updatedFilePath], `task ${updatedLane}/${filename} updated`)

    return reply.redirect(`/view/${updatedLane}/${filename}`)
  })
}
