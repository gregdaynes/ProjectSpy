import { join } from 'node:path'
import fp from 'fastify-plugin'

const plugin = {
  name: 'request-prepare-params',
  dependencies: [],
}

export default fp(async (fastify) => {
  fastify.decorate('preHandlerParams', async (request, reply) => {
    const { lane, filename } = request.params

    const safeName = filename.replace('/', '_')
    const filePath = join(request.config.dirPath, lane, safeName)

    request.ctx = {
      ...request.ctx,
      lane,
      filename,
      filePath
    }
  })
}, plugin)
