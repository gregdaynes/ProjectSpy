import fs from 'node:fs/promises'
import { join } from 'node:path'
import fp from 'fastify-plugin'
import { pathExists, buildPath } from 'lib/utils.js'
import '../types.js'

const plugin = {
  name: 'cli',
  dependencies: ['application-config'],
}

export default fp(async (fastify, opts) => {
  if (!opts.cmd) return
  fastify.log.debug({ plugin }, 'Command line plugin lodaded.')

  /**
   * @param {PSConfig} config project spy config
   * @returns {void}
   */
  async function init ({ absolutePath, lanes }) {
    for (const lane of [...lanes, ['_archive', 'Archive'], ['_test', 'Test']]) {
      const lanePath = join(absolutePath, lane[0])

      const laneExists = await pathExists(lanePath)
      if (!laneExists) {
        await fs.mkdir(lanePath, { recursive: true })

        fastify.log.debug({ lanePath }, 'Created lane directory')
      }
    }
  }

  /**
   * @param {PSConfig} config project spy config
   * @returns {void}
   */
  async function newTask ({ lanes }) {
    const readline = await import('node:readline/promises')
    const { stdin: input, stdout: output } = await import('node:process')
    const { default: slugify } = await import('slugify')

    const rl = readline.createInterface({ input, output })
    const title = await rl.question('Task title: ')
    if (!title) {
      console.error('Error title required.')
      process.exit(1)
    }
    const name = slugify(title, { strict: true, lower: true }) + '.md'

    const laneList = lanes.map(([_lane, name], i) => `[${i}] ${name}`)
    const laneQuestion = [
      'Which lane?',
      ...laneList,
      'Enter number: '
    ].join('\n')

    const lane = await rl.question(laneQuestion)
    if (!title) {
      console.error('Error lane required.')
      process.exit(1)
    }

    // create directories for new task
    const lanePath = buildPath(fastify.config.dirPath, lanes[lane][0])
    const lanePathExists = await pathExists(lanePath)
    if (!lanePathExists) {
      output.write('Lane path does not exist. Creating path for task')
      await fs.mkdir(lanePath, { recursive: true })
    }

    const filePath = join(lanePath, name)
    const filePathExists = await pathExists(filePath)
    if (filePathExists) {
      // TODO we should add some uniquiness to the task file name and write
      output.write(`Error\tTask already exists in ${lanes[lane][1]}\n`)
      process.exit(1)
    }

    await fs.writeFile(filePath, `${title}\n===\n`)
  }

  const fns = {
    init: init.bind(null, fastify.config), // create configured projectspy directories
    new: newTask.bind(null, fastify.config)
  }

  await fns[opts.cmd]()

  process.exit(1)
}, plugin)
