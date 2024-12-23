import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 *
 * @param fastify
 */
export default async function (fastify) {
  fastify.get('/archive/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:archive:params',
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
        title: 'Archive Task',
      },
      task: {
        ...builtTask,
        content: task.render(),
        rawContents: task.rawContents(),
        lane,
        filePath: task.relativePath,
      },
      confirmArchiveDialog: true,
    }

    return reply.view('view', data)
  })

  fastify.post('/archive/:lane/:filename', {
    schema: {
      params: {
        $id: 'app:archive:params:post',
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

    let fileContent = await readFile(filePath, { encoding: 'utf-8' })
    const updatedFilePath = join(request.server.config.dirPath, '_archive', filename)

    fileContent = request.logToTask(fileContent, 'Archived task')

    await request.server.changeFile({
      lane: '_archive',
      filename,
      filePath: updatedFilePath,
      contents: fileContent
    })

    await request.server.deleteFile({ filename, lane, filePath })

    return reply.redirect('/')
  })
}
