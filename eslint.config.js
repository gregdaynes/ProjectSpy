import neostandard from 'neostandard'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  ...neostandard(),
  jsdoc.configs['flat/recommended'],
]
