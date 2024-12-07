export default async function root (fastify, _opts) {
  fastify.get('/manifest.json', function manifestHandler (request, reply) {
    reply.header(
      'cache-control',
      `public, max-age=${request.server.config.STATIC_MAX_AGE}`
    )

    return {
      name: 'ProjectSpy',
      short_name: 'ps',
      start_url: `http://${request.hostname}/`,
      scope: `http://${request.hostname}/`,
      icons: [
        {
          src: '/assets/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/assets/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
      orientation: 'portrait',
    }
  })
}
