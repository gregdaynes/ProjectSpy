import fs from 'node:fs/promises'
import { join, parse } from 'node:path'
import slugify from 'slugify'
import { randomBytes } from 'node:crypto'

/**
 * @param {string} path path to check for existance
 * @returns {Promise<boolean>} true if path exists
 */
export async function pathExists (path) {
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

/**
 * @param {Array<string>} path parts of path to build
 * @returns {string} absolute path to file
 */
export function buildPath (...path) {
  return join(process.cwd(), ...path)
}

export async function makePath (path) {
  if (!await pathExists(path)) {
    try {
      await fs.mkdir(path, { recursive: true })
    } catch (err) {
      throw new Error(err)
    }
  }
}

export async function prepareFilePath (path, updateExisting = false) {
  let { dir, name, ext } = parse(path)
  if (!ext) ext = '.md'

  let fileName
  if (!updateExisting && await pathExists(path)) {
    const suffix = randomBytes(3).toString('hex')

    fileName = slugify(`${name}-${suffix}`, { strict: true, lower: true }) + ext
  } else {
    fileName = slugify(`${name}`, { strict: true, lower: true }) + ext
  }

  const filePath = join(dir, fileName)
  return { fileName, filePath }
}
