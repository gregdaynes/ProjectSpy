import { join } from 'node:path'
import fp from 'fastify-plugin'
import fastifyView from '@fastify/view'
import { Eta } from 'eta'
import minifier from 'html-minifier'

const plugin = {
  name: 'view',
  dependencies: ['application-config'],
}

export default fp(async (fastify) => {
  fastify.register(fastifyView, {
    engine: {
      eta: new Eta(),
    },
    propertyName: 'view',
    options: {
      useHtmlMinifier: fastify.config.minifyHtml && minifier,
      htmlMinifierOptions: {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true,
      },
      pathsToExcludeHtmlMinifier: ['/test'],
    },
    root: join(import.meta.dirname, '..', 'views'),
    send: {
      lastModified: true,
      maxAge: fastify.config.maxAge,
    },
    viewExt: 'html',
    defaultContext: {
      flash: [],
      scripts: [],
    },
  })

  fastify.log.debug({ plugin }, 'Loaded plugin')
}, plugin)
