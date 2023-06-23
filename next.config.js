const path = require('path')

const nextConfig = {
  experimental: {
    serverActions: true,
    appDir: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

module.exports = nextConfig
