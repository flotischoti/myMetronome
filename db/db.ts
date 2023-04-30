import { PrismaClient } from '@prisma/client'

export function getDb() {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient()
    }
    return global.prisma
  }
}
