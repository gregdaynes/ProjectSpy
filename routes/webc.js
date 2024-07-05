import { WebC } from '@11ty/webc'
import { join } from 'node:path'

export default async function (fastify) {
  fastify.get('/webc/demo', async (request, reply) => {
    const page = new WebC()
    page.defineComponents(join(import.meta.dirname, 'webc', '**.webc'))
    page.setInputPath(join(import.meta.dirname, 'webc', 'layout.webc'))

    const data = {
      user: 'testy mctesterson',
      num: 3,
    }

    const { html } = await page.compile({ data })

    reply.headers({
      'Content-Type': 'text/html',
    })
    return reply.send(html)
  })
}
