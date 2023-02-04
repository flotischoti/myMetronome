import { PrismaClient } from '@prisma/client'
import { StoredMetronome } from '../components/metronome/Metronome'

const prisma = new PrismaClient()

export function getLastOpened(user: string): StoredMetronome | null {
  return null
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
