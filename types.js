/**
 * @typedef {string} DiskName lane directory name in local filesystem
 * @typedef {string} DisplayName name to show in user visible messages
 * @typedef {object} PSConfig
 * @property {boolean} minifyHtml minify response output when html
 * @property {number} maxAge http cache time
 * @property {string} dirPath relative path to projectSpy directory
 * @property {string} absolutePath absolute path to project on disk
 * @property {Array<[DiskName, DisplayName]>} lanes lane definition array. Output of  Object.entries({ key: value })
 */
