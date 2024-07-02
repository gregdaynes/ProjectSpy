import { join } from 'node:path'
import { test, assert } from './helper.js'
import TaskFactory from '../task.js'

test('Task File Implementation', async (t) => {
  await t.test('Given a file path:', async (t) => {
    await t.test('meta data', async () => {
      const task = await TaskFactory(join(import.meta.dirname, './task-example.md'), import.meta.dirname)

      assert.equal(task.title, '# Test Task Example of File Reading')
      assert.equal(task.description, 'Example file for testing against')
      assert.equal(task.created.toISOString(), new Date('2024-07-02T02:56:53.178Z').toISOString())
      assert.equal(task.modified.toISOString(), new Date('2024-07-02T02:56:53.178Z').toISOString())
      assert.equal(task.priority, 2)
      assert.equal(task.tags.sort().join(), ['tag', 'long tag'].sort().join())
      assert.equal(task.manualOrder, 2)

      assert.equal(task.titleHTML, '<h1>Test Task Example of File Reading</h1>')
      assert.equal(task.descriptionHTML, '<p>Example file for testing against</p>')

      assert.equal(task.render(), '<h1>Test Task Example of File Reading</h1>\n' +
                                  '<p>Example file for testing against</p>'
      )
    })

    await t.test('header style hashes', async () => {
      const task = await TaskFactory(join(import.meta.dirname, './task-example-hashes.md'), import.meta.dirname)

      assert.equal(task.title, '## Test Task Example of File Reading')
      assert.equal(task.titleHTML, '<h2>Test Task Example of File Reading</h2>')
      assert.equal(task.render(), '<h2>Test Task Example of File Reading</h2>\n' +
                                  '<p>Example file for testing against</p>'
      )
    })

    await t.test('header style equals', async () => {
      const task = await TaskFactory(join(import.meta.dirname, './task-example-equals.md'), import.meta.dirname)

      assert.equal(task.title, '#  Test Task Example of File Reading')
      assert.equal(task.titleHTML, '<h1>Test Task Example of File Reading</h1>')
      assert.equal(task.render(), '<h1>Test Task Example of File Reading</h1>\n' +
                                  '<p>Example file for testing against</p>'
      )
    })

    await t.test('header style hyphens', async () => {
      const task = await TaskFactory(join(import.meta.dirname, './task-example-hyphens.md'), import.meta.dirname)

      assert.equal(task.title, '##  Test Task Example of File Reading')
      assert.equal(task.titleHTML, '<h2>Test Task Example of File Reading</h2>')
      assert.equal(task.render(), '<h2>Test Task Example of File Reading</h2>\n' +
                                  '<p>Example file for testing against</p>'
      )
    })
  })
})
