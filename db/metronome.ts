import { PrismaClient } from '@prisma/client'
import { StoredMetronome } from '../components/metronome/Metronome'
import util from 'util'

const prisma = new PrismaClient()

export function getLastOpened(user: string): StoredMetronome | null {
  return null
}

export function create(metronome: StoredMetronome, userId: number): boolean {
  console.log(`user: ${userId}`)
  console.log(`metronome: ${util.inspect(metronome, false, null, true)}`)
  return true
}

export function save(metronome: StoredMetronome): boolean {
  return true
}

export async function get(id: number): Promise<StoredMetronome | null> {
  return await prisma.metronome.findUnique({
    where: {
      id: id,
    },
  })
}
