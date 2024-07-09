import { join } from 'node:path'
import { writeFile, unlink, readFile } from 'node:fs/promises'
import TaskFactory from '../task.js'

export default async function (fastify) {
  fastify.post('/update/:lane/:filename', async (request, reply) => {
    let { lane, filename } = request.params

    const filePath = join(request.server.config.dirPath, lane, filename)
    // const task = request.taskList().get(filePath)
    const fileContents = await readFile(filePath, { encoding: 'utf-8' })

    // TODO this is gonna be rough. We should clean and hash both to determine if they are the same
    const newFileContents = request.body.content
    if (fileContents !== newFileContents) {
		  // TODO we should combine the writes, so their is only a single disk write at the end
      await writeFile(filePath, newFileContents)
      // TODO we also need to force update the task in our taskList
      const newTask = await TaskFactory(filePath, request.server.config.dirPath)
      request.updatePath(filePath, filePath, newTask)
    }

    // move the file if the lane has changed
    if (lane !== request.body.lane) {
      lane = request.body.lane

      const newFilePath = join(request.server.config.dirPath, lane, filename)

      await writeFile(newFilePath, fileContents)
      await unlink(filePath)

      const newTask = await TaskFactory(newFilePath, request.server.config.dirPath)
      request.updatePath(filePath, newFilePath, newTask)
    }

    return reply.redirect(`/view/${request.body.lane}/${filename}`)
  })
}
