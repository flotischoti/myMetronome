import { NextApiRequest, NextApiResponse } from 'next'
import * as metronomeDb from '../../../../db/metronome'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = req.query
  if (!isValidUserId(user)) {
    res.status(403)
  }

  switch (req.method) {
    case 'GET':
      res.status(200).send('HALLO')
      break
    case 'POST':
      metronomeDb.create(req.body, Number(user))
      break
    case 'PUT':
  }
}

function isValidUserId(userId: String | String[]): boolean {
  return userId && !Number.isNaN(Number(userId))
}
