// required for Azure App Service hosting to avoid CSRF errors
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.WEBSITE_HOSTNAME,
        'localhost:8080',
        'localhost:3000',
        '0.0.0.0:3000',
      ].filter(Boolean),
    },
  },
}

module.exports = nextConfig
