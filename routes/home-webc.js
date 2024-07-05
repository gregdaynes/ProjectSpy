import { WebC } from '@11ty/webc'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/webc/', async (request, reply) => {
    const page = new WebC()
    page.defineComponents(join(import.meta.dirname, 'webc', '**.webc'))
    page.setInputPath(join(import.meta.dirname, 'webc', 'layout.webc'))

    const filePathsGroupedByLane = request.filePathsGroupedByLane()
    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)

          return {
            relativePath: task.relativePath,
            title: task.title,
            descriptionHTML: task.descriptionHTML,
          }
        }),
      }
    })

    // this is our locals data
    const data = {
      ...reply.locals,
      taskLanes,
      tasks: request.taskList(),
    }

    const { html } = await page.compile({ data })

    reply.headers({
      'Content-Type': 'text/html',
    })
    return reply.send(html)
  })
}
