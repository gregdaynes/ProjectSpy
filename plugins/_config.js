import fp from 'fastify-plugin'
import { pathExists, buildPath } from 'lib/utils.js'
import '../types.js'

const plugin = {
  name: 'application-config',
  dependencies: []
}

export default fp(async (fastify) => {
  /**
   * @var {PSConfig}
   */
  let config = {
    minifyHtml: true,
    maxAge: 600000, // 10 minutes
    dirPath: '.projectSpy',
    absolutePath: buildPath('.projectSpy'),
    lanes: {
      backlog: 'Backlog',
      'in-progress': 'In Progress',
      done: 'Done',
    },
  }

  // load custom configuration file if exists
  const path = buildPath(config.dirPath, 'projectspy.json')
  if (await pathExists(path)) {
    const { default: customConfig } = await import(path, { with: { type: 'json' }})

    config = Object.assign(config, customConfig)
  }

  config.laneKeys = Object.keys(config.lanes)
  config.lanes = Object.entries(config.lanes)

  fastify.decorate('config', config)

  fastify.log.debug({ plugin, config }, 'Loaded plugin')
}, plugin)
