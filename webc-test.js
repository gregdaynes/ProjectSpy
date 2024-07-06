import { WebC } from '@11ty/webc'
import { join } from 'node:path'

const page = new WebC()

page.setInputPath(join(import.meta.dirname, 'routes', 'webc', 'x.webc'))
page.defineComponents(join(import.meta.dirname, 'routes', 'webc', '**/*.webc'))

const { html } = await page.compile({
  data: {
    dataProperty: '<h1>Huh?</h1>',
    title: 'WebC Test',
    content: 'Hello, World!',
  },
})

console.log({ html })

// function xyz (strings, ...values) {
//   return String.raw({ raw: strings }, ...values)
// }
//
// const World = 'World'
//
// console.log(xyz`Hello, ${World}!`)
