import { join } from 'node:path'
import { writeFile, unlink, readFile } from 'node:fs/promises'
import TaskFactory from '../task.js'

export default async function (fastify) {
  fastify.post('/update/:lane/:filename', async (request, reply) => {
    let { lane, filename } = request.params

    const filePath = join(request.server.config.dirPath, lane, filename)
    // const task = request.taskList().get(filePath)
    const fileContents = await readFile(filePath, { encoding: 'utf-8' })

    // Things that change
    // TODO this is gonna be rough. We should clean and hash both to determine if they are the same
    const updatedContents = request.body.content
    let updatedFilePath = filePath
    let hasUpdatedContent = false
    let hasUpdatedPath = false
    let newTask

    if (fileContents !== updatedContents) {
      hasUpdatedContent = true
    }

    // move the file if the lane has changed
    if (lane !== request.body.lane) {
      hasUpdatedPath = true
      lane = request.body.lane
      updatedFilePath = join(request.server.config.dirPath, lane, filename)
    }

    // Write file changes including new file if moved
    if (hasUpdatedContent || hasUpdatedPath) {
      await writeFile(updatedFilePath, updatedContents)
    }

    // delete the old file
    if (hasUpdatedPath) {
      await unlink(filePath)
    }

    // update the task in the taskList
    if (hasUpdatedContent || hasUpdatedPath) {
      newTask = await TaskFactory(updatedFilePath, request.server.config.dirPath)
      request.updatePath(filePath, updatedFilePath, newTask)
    }

    return reply.redirect(`/view/${request.body.lane}/${filename}`)
  })
}
