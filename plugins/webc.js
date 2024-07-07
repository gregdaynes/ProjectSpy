import fp from 'fastify-plugin'
import { watch } from 'node:fs/promises'
import { join } from 'node:path'
import { WebC } from '@11ty/webc'
import { createHash } from 'node:crypto'

export default fp(
  async function pluginConfig (fastify, opts) {
    opts = Object.assign({}, {
      componentsDir: join(import.meta.dirname, '..', 'routes', 'webc'),
      bundlerMode: true,
      liveReload: true,
    }, opts)

    const state = new HTMLGenerator(fastify, opts)

    // reply.render('my-view.webc', locals)
    fastify.decorateReply('render', async function (filename, locals) {
      const { html } = await state.render(filename, locals)

      this.headers({
        'Content-Type': 'text/html; charset=utf-8',
      })

      return this.send(html)
    })

    if (opts.liveReload) {
      fastify.get('/assets/:filename', function (request, reply) {
        const { filename } = request.params
        const css = state.getCSS(filename)

        reply.headers({
          'Content-Type': 'text/css; charset=utf-8',
        })

        return reply.send(css)
      })
    }

    if (opts.liveReload) {
      const abortController = new AbortController()
      const { signal } = abortController

      ;(async () => {
        const watcher = watch(opts.componentsDir, { recursive: true, signal })

        for await (const { filename } of watcher) {
          fastify.log.info('File changed: %s', filename)

          if (filename.endsWith('.webc')) {
            const pages = state.getPagesWithComponent(filename)

            for (const [filename, { locals }] of pages) {
              const { cssFilename } = await state.render(filename, locals)

              fastify.sendLiveReloadCommand('reload', cssFilename)
            }
          }

          if (filename.endsWith('.css')) {
            const pages = state.getPages()

            for (const [filename, { locals }] of pages) {
              const { cssFilename } = await state.render(filename, locals)

              fastify.sendLiveReloadCommand('reload', cssFilename)
            }
          }
        }
      })()
    }
  },
  {
    name: 'webc',
    dependencies: ['application-config', 'livereload'],
  }
)

class HTMLGenerator {
  pageComponents = {}
  pages = {}
  cssBuffers = {}

  constructor ({ generateLiveReloadScript }, { componentsDir, bundlerMode, liveReload }) {
    this.componentsDir = componentsDir
    this.bundlerMode = bundlerMode
    this.generateLiveReloadScript = generateLiveReloadScript
    this.liveReload = liveReload
  }

  getCSS (filename) {
    return this.cssBuffers[filename]
  }

  getPages () {
    return Object.entries(this.pages)
  }

  getPagesWithComponent (filename) {
    const pageNamesToCompile = this.pageComponents[filename]
    return this.getPages().filter(([pageName]) => pageNamesToCompile.has(pageName))
  }

  updateComponents (components, filename) {
    for (const component of components) {
      const name = component.replace(this.componentsDir + '/', '')

      if (this.pageComponents[name] === undefined) {
        this.pageComponents[name] = new Set([filename])
      } else {
        this.pageComponents[name].add(filename)
      }
    }
  }

  async render (filename, locals) {
    const cssFilename = `style-${createHash('sha256').update(filename, 'utf8').digest('hex')}.css`
    let { css, html, js, components } = await this.renderWebC(filename, locals)

    css = css.join('\n')
    js = js.join('\n')

    if (this.bundlerMode) {
      let cssMarkup = ''

      if (this.liveReload) {
        this.cssBuffers[cssFilename] = css
        this.pages[filename] = { locals }
        this.updateComponents(components, filename)

        cssMarkup = `<link rel="stylesheet" href="/assets/${cssFilename}">`
      } else {
        cssMarkup = `<style>${css}</style>`
      }

      js = `<script>${js}</script>`
      js += this.generateLiveReloadScript()

      html = html.replace(/<\/head>/, cssMarkup + '</head>')
        .replace(/<\/body>/, js + '</body>')
    }

    return { html, css, js, cssFilename }
  }

  async renderWebC (filename, data) {
    const componentsDir = this.componentsDir
    const bundlerMode = this.bundlerMode
    const inputPath = join(componentsDir, filename)
    const components = join(componentsDir, '**.webc')

    const page = new WebC()
    page.setBundlerMode(bundlerMode)
    page.defineComponents(components)
    page.setInputPath(inputPath)

    return page.compile({ data })
  }
}
