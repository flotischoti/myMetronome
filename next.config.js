const path = require('path')

const nextConfig = {
  experimental: {
    serverActions: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
