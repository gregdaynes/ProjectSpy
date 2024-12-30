import fs from 'node:fs/promises'
import { join } from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fp from 'fastify-plugin'
import slugify from 'slugify'

export default fp(
  async function cmd (fastify, opts) {
    if (!opts.cmd) return

    // create configured projectspy directories
    if (opts.cmd === 'init') {
      const path = join(process.cwd(), fastify.config.dirPath)
      const exists = await pathExists(path)

      if (!exists) {
        await fs.mkdir(path, { recursive: true })
      }

      for (const lane of [...fastify.config.lanes, ['_archive', 'Archive']]) {
        const lanePath = join(path, lane[0])

        const laneExists = await pathExists(lanePath)
        if (!laneExists) {
          await fs.mkdir(lanePath, { recursive: true })
        }
      }
    }

    // new file
    if (opts.cmd === 'new') {
      const rl = readline.createInterface({ input, output })
      const title = await rl.question('Task title: ')
      if (!title) {
        console.error('Error title required.')
        process.exit(1)
      }
      const name = slugify(title, { strict: true, lower: true }) + '.md'

      const lanes = Object.entries(fastify.config.lanes).map(([_lane, name], i) => `[${i}] ${name}`)
      const laneQuestion = [
        'Which lane?',
        ...lanes,
        'Enter number: '
      ].join('\n')

      const lane = await rl.question(laneQuestion)
      if (!title) {
        console.error('Error lane required.')
        process.exit(1)
      }

      // create file
      const lanePath = join(process.cwd(), fastify.config.dirPath, Object.entries(fastify.config.lanes)[lane][0])
      const lanePathExists = await pathExists(lanePath)
      if (!lanePathExists) {
        console.error('Lane directory does not exist. Run \'projectspy init\' to create directories')
        process.exit(1)
      }

      const filePath = join(lanePath, name)
      const filePathExists = await pathExists(filePath)
      if (filePathExists) {
        console.error(`Task already exists in ${Object.entries(fastify.config.lanes)[lane][1]}`)
        process.exit(1)
      }

      await fs.writeFile(filePath, `${title}\n===\n`)
    }

    process.exit(1)
  },
  {
    dependencies: ['application-config'],
  }
)

/**
 *
 * @param path
 */
async function pathExists (path) {
  try {
    await fs.stat(path)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw new Error(err)
  }
}
