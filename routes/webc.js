import { WebC } from '@11ty/webc'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/webc/demo', async (request, reply) => {
    const page = new WebC()
    page.defineComponents(join(import.meta.dirname, 'webc', '**.webc'))
    page.setInputPath(join(import.meta.dirname, 'webc', 'layout.webc'))

    const data = {
      dataProperty: 'some data in data.dataProperty',
      user: 'testy mctesterson',
      num: 3,
    }

    // const { html } = await page.compile({ data })

    const { html, css, js, components } = await page.compile({
      data: {
        dataProperty: 'dataValue',
      },
    })

    reply.headers({
      'Content-Type': 'text/html',
    })
    return reply.send(html)
  })
}
