import { NextApiRequest, NextApiResponse } from 'next'
import * as metronomeDb from '../../../../../db/metronome'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { metronomeId } = req.query

  switch (req.method) {
    case 'GET':
      if (!isValidMetronomeId(metronomeId)) {
        res.status(403)
      }
      console.log(metronomeId)
      const metronome = await metronomeDb.get(Number(metronomeId))
      res.status(200).json(metronome)
    case 'POST':
    case 'PUT':
  }
}

function isValidMetronomeId(metronomeId: String | String[]): boolean {
  return metronomeId && !Number.isNaN(Number(metronomeId))
}
