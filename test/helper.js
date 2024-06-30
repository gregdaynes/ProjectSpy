import test from 'node:test'
import assert from 'node:assert/strict'
import fastifyCLI from 'fastify-cli/helper.js'

const startArgs = '--options app.js -- --test'

const defaultEnv = {
  LOG_LEVEL: 'silent',
  NODE_ENV: 'test',
}

function config (env) {
  return {
    configData: env,
  }
}

async function buildApp (t, env, serverOptions) {
  const app = await fastifyCLI.build(
    startArgs,
    config({ ...defaultEnv, ...env }),
    serverOptions
  )

  if (t) {
    t.after(async () => {
      if (app.close) app.close()
    })
  }

  return app
}

export {
  test,
  assert,
  buildApp,
}
