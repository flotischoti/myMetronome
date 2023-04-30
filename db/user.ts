import { getDb } from './db'

const prisma = getDb()

export interface User {
  id?: number
  email: string
  password: string
  token?: string
}

export async function get(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  })
}

export async function create(user: User): Promise<User> {
  return await prisma.user.create({
    data: user,
  })
}
