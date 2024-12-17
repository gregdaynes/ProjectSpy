import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import TaskFactory from '../task.js'
import slugify from 'slugify'

export default async function (fastify) {
  fastify.post('/create', {

  }, async (request, reply) => {
    const { lane, content, name } = request.body
    const filename = slugify(name, { strict: true, lower: true }) + '.md'

    const filePath = join(request.dir, lane, filename)

    await writeFile(filePath, content)
    const newTask = await TaskFactory(filePath, request.server.config.dirPath)
    request.updatePath(filePath, filePath, newTask)

    return reply.redirect(`/view/${request.body.lane}/${filename}`)
  })

  fastify.get('/new', {
    schema: {
      query: {
        $id: 'app:task:new:query',
        type: 'object',
        properties: {
          lane: {
            type: 'string'
          }
        }
      }
    }
  }, async (request, reply) => {
    const { lane } = request.query
    const filePathsGroupedByLane = request.filePathsGroupedByLane()

    const taskLanes = request.server.config.lanes.map(([lane, name]) => {
      return {
        name,
        tasks: filePathsGroupedByLane[lane]?.map((filePath) => {
          const task = request.taskList().get(filePath)
          return request.buildTask(task)
        }) || [],
      }
    })

    const data = {
      ...reply.locals,
      page: {
        title: 'New Task',
      },
      taskLanes,
      lanes: request.server.config.lanes,
      task: {
        task: 'New Task',
        content: '',
        rawContents: '',
        lane: lane || null,
        tags: [],
        actions: {
          update: '/create'
        },
        filePath: ''
      }
    }

    return reply.view('new', data)
  })
}
