import { join } from 'node:path'
import fp from 'fastify-plugin'
import fastifyView from '@fastify/view'
import { Eta } from 'eta'
import minifier from 'html-minifier'

export default fp(
  async function pluginView (fastify, _opts) {
    fastify.register(fastifyView, {
      engine: {
        eta: new Eta(),
      },
      propertyName: 'view',
      options: {
        useHtmlMinifier: fastify.config.MINIFY_HTML && minifier,
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
      viewExt: 'html',
      defaultContext: {
        flash: [],
        scripts: [],
      },
    })
  },
  {
    dependencies: ['application-config'],
  }
)
