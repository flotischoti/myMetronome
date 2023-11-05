import { getDb } from './db'

const prisma = getDb()

export interface User {
  id?: number
  name: string
  email?: string
  password: string
  token?: string
}

export async function get(name: string): Promise<User | null> {
  return (await prisma.user.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  })) as User | null
}

export async function create(user: User): Promise<User> {
  return (await prisma.user.create({
    data: user,
  })) as User
}

export async function update(user: User): Promise<User> {
  return (await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...user,
    },
  })) as User
}

export async function remove(user: User) {
  const deleteMetronomes = prisma.metronome.deleteMany({
    where: {
      owner: user.id,
    },
  })

  const deleteUser = prisma.user.delete({
    where: {
      id: user.id,
    },
  })

  const transaction = await prisma.$transaction([deleteMetronomes, deleteUser])
}
