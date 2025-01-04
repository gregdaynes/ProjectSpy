import fp from 'fastify-plugin'

const plugin = {
  name: 'request-prepare-params',
  dependencies: [],
}

export default fp(async (fastify) => {
  fastify.decorate('preHandlerParams', async (request) => {
    const { lane, filename } = request.params

    request.ctx = {
      ...request.ctx,
      lane,
      filename,
    }
  })
}, plugin)
