import { NextApiRequest, NextApiResponse } from 'next'
import * as metronomeDb from '../../../../../db/metronome'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, metronomeId } = req.query

  if (!isValidMetronomeId(metronomeId)) {
    res.status(403).json({ message: `Invalid metronomeId: ${metronomeId}` })
  }

  switch (req.method) {
    case 'GET':
      const metronome = await metronomeDb.get(Number(metronomeId))
      res.status(200).json(metronome)
    case 'POST':
      console.log(userId)
      // console.log(metronome)
      break
    case 'PUT':
      break
    case 'DELETE':
      const success = await metronomeDb.deleteMetronome(Number(metronomeId))
      const status = success ? 200 : 500
      const message = success
        ? {}
        : { message: `Error deleting metronome with Id: ${metronomeId}` }
      res.status(status).json(message)
  }
}

function isValidMetronomeId(metronomeId: String | String[]): boolean {
  return metronomeId && !Number.isNaN(Number(metronomeId))
}
