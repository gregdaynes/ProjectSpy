import fs from 'node:fs/promises'
import { join } from 'node:path'

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
