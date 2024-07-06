import { join } from 'node:path'
import { WebC } from '@11ty/webc'

export default async function (fastify) {
  fastify.get('/webc/view/:lane/:filename', async (request, reply) => {
    const { lane, filename } = request.params
    const filePath = join(request.server.config.dirPath, lane, filename)

    const task = request.taskList().get(filePath)

    if (task === undefined) {
      return reply.redirect('/')
    }

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

    const data = {
      ...reply.locals,
      taskLanes,
      tasks: request.taskList(),
      lanes: request.server.config.lanes,

      task: {
        ...task,
        content: task.render(),
        lane,
        filePath: task.relativePath,
      },
    }

    const page = new WebC()
    page.setBundlerMode(true)
    page.defineComponents(join(import.meta.dirname, 'webc', '**.webc'))
    page.setInputPath(join(import.meta.dirname, 'webc', 'ps-view.webc'))

    let { html, js, css } = await page.compile({ data })

    css = '<style>' + css.join('\n') + '</style>'
    js = '<script>' + js.join('\n') + '</script>'

    html = html.replace(/<\/body>/, js + '</body>')
    html = html.replace(/<\/head>/, css + '</head>')

    reply.headers({
      'Content-Type': 'text/html',
    })

    return reply.send(html)
  })
}
