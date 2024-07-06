import { WebC } from '@11ty/webc'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/', async (request, reply) => {
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
    }

    const page = new WebC()
    page.setBundlerMode(true)
    page.defineComponents(join(import.meta.dirname, 'webc', '**.webc'))
    page.setInputPath(join(import.meta.dirname, 'webc', 'ps-home.webc'))

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
