import { PrismaClient } from '@prisma/client'
import { StoredMetronome } from '../components/metronome/Metronome'
import util from 'util'

const prisma = new PrismaClient()

export function getLastOpened(user: string): StoredMetronome | null {
  return null
}

export async function create(
  metronome: StoredMetronome,
  userId: number
): Promise<StoredMetronome> {
  console.log(`user: ${userId}`)
  console.log(`metronome: ${util.inspect(metronome, false, null, true)}`)

  const createdMetronome = await prisma.metronome.create({
    data: {
      bpm: metronome.bpm,
      name: metronome.name,
      beats: metronome.beats,
      owner: userId,
      showStats: metronome.showStats,
      stressFirst: metronome.stressFirst,
      timerActive: metronome.timerActive,
      timerValue: metronome.timerValue,
      timeUsed: metronome.timeUsed,
    },
  })
  return createdMetronome
}

export async function updateMetronome(
  metronome: StoredMetronome
): Promise<StoredMetronome> {
  const updatedMetronome = await prisma.metronome.update({
    where: {
      id: metronome.id,
    },
    data: {
      bpm: metronome.bpm,
      name: metronome.name,
      beats: metronome.beats,
      showStats: metronome.showStats,
      stressFirst: metronome.stressFirst,
      timerActive: metronome.timerActive,
      timerValue: metronome.timerValue,
      timeUsed: metronome.timeUsed,
    },
  })
  return updatedMetronome
}

export async function deleteMetronome(metronomeId: number): Promise<boolean> {
  if (
    await prisma.metronome.delete({
      where: {
        id: metronomeId,
      },
    })
  )
    return true
  return false
}

export async function get(id: number): Promise<StoredMetronome | null> {
  return await prisma.metronome.findUnique({
    where: {
      id: id,
    },
  })
}
